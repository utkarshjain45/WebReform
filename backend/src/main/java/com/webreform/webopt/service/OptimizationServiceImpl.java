package com.webreform.webopt.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webreform.webopt.dto.*;
import com.webreform.webopt.exception.ResourceNotFoundException;
import com.webreform.webopt.exception.ServiceUnavailableException;
import com.webreform.webopt.model.OptimizationRun;
import com.webreform.webopt.model.OptimizedStructure;
import com.webreform.webopt.model.Page;
import com.webreform.webopt.model.PageLink;
import com.webreform.webopt.model.Website;
import com.webreform.webopt.repository.OptimizationRunRepository;
import com.webreform.webopt.repository.OptimizedStructureRepository;
import com.webreform.webopt.repository.PageLinkRepository;
import com.webreform.webopt.repository.PageRepository;
import com.webreform.webopt.repository.WebsiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OptimizationServiceImpl implements OptimizationService {

    private static final Logger log = LoggerFactory.getLogger(OptimizationServiceImpl.class);

    private final OptimizationRunRepository optimizationRunRepository;
    private final OptimizedStructureRepository optimizedStructureRepository;
    private final WebsiteRepository websiteRepository;
    private final PageRepository pageRepository;
    private final PageLinkRepository pageLinkRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String optimizerServiceUrl;

    public OptimizationServiceImpl(
            OptimizationRunRepository optimizationRunRepository,
            OptimizedStructureRepository optimizedStructureRepository,
            WebsiteRepository websiteRepository,
            PageRepository pageRepository,
            PageLinkRepository pageLinkRepository,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${optimizer.service.url:http://localhost:8000}") String optimizerServiceUrl
    ) {
        this.optimizationRunRepository = optimizationRunRepository;
        this.optimizedStructureRepository = optimizedStructureRepository;
        this.websiteRepository = websiteRepository;
        this.pageRepository = pageRepository;
        this.pageLinkRepository = pageLinkRepository;
        this.objectMapper = objectMapper;
        this.optimizerServiceUrl = optimizerServiceUrl;
        this.restClient = restClientBuilder.baseUrl(optimizerServiceUrl).build();
    }

    @Override
    @Transactional(noRollbackFor = {ServiceUnavailableException.class, IllegalStateException.class})
    public OptimizationRunResponseDto runOptimization(RunOptimizationRequestDto request) {
        // 1. Load and validate website
        Website website = websiteRepository.findById(request.websiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Website", "id", request.websiteId()));

        // 2. Load pages and links
        List<Page> pages = pageRepository.findByWebsiteId(request.websiteId());
        if (pages.size() < 2) {
            throw new IllegalArgumentException(
                    "Cannot optimize website: requires at least 2 crawled pages, found " + pages.size()
            );
        }

        List<PageLink> links = pageLinkRepository.findAllByWebsiteId(request.websiteId());

        // 3. Initialize OptimizationRun record in PostgreSQL
        int popSize = request.populationSize() != null ? request.populationSize() : 25;
        int iters = request.iterations() != null ? request.iterations() : 50;
        int seed = request.randomSeed() != null ? request.randomSeed() : 42;
        int maxDepth = request.maxDepth() != null ? request.maxDepth() : 3;
        int maxChildren = request.maxChildren() != null ? request.maxChildren() : 6;

        OptimizationRun run = new OptimizationRun(website, popSize, iters);
        run.setRandomSeed(seed);
        run.setMaxDepth(maxDepth);
        run.setMaxChildren(maxChildren);
        run.setStatus("RUNNING");
        run = optimizationRunRepository.save(run);

        // 4. Build payload for Python FastAPI
        List<Map<String, Object>> pagesPayload = pages.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("url", p.getUrl());
            map.put("title", p.getTitle() != null ? p.getTitle() : "");
            map.put("content", p.getContent() != null ? p.getContent() : "");
            map.put("depth", p.getDepth() != null ? p.getDepth() : 0);
            map.put("access_frequency", 1.0);
            return map;
        }).toList();

        List<Map<String, Object>> linksPayload = links.stream().map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("source_id", l.getSourcePage().getId());
            map.put("target_id", l.getTargetPage().getId());
            return map;
        }).toList();

        Map<String, Object> weightsPayload = new HashMap<>();
        if (request.weights() != null) {
            weightsPayload.put("navigation", request.weights().getNavigationSafe());
            weightsPayload.put("behavior", request.weights().getBehaviorSafe());
            weightsPayload.put("structural", request.weights().getStructuralSafe());
            weightsPayload.put("depth", request.weights().getDepthSafe());
            weightsPayload.put("semantic", request.weights().getSemanticSafe());
        } else {
            weightsPayload.put("navigation", 0.35);
            weightsPayload.put("behavior", 0.25);
            weightsPayload.put("structural", 0.20);
            weightsPayload.put("depth", 0.20);
            weightsPayload.put("semantic", 1.0);
        }

        Map<String, Object> optimizerRequest = new HashMap<>();
        optimizerRequest.put("pages", pagesPayload);
        optimizerRequest.put("links", linksPayload);
        optimizerRequest.put("population_size", popSize);
        optimizerRequest.put("iterations", iters);
        optimizerRequest.put("max_depth", maxDepth);
        optimizerRequest.put("max_children", maxChildren);
        optimizerRequest.put("random_seed", seed);
        optimizerRequest.put("weights", weightsPayload);

        // 5. Call Python FastAPI GWO optimizer
        PythonOptimizationResultDto pythonResult;
        try {
            log.info("Dispatching GWO optimization request for run {} to Python service at {}", run.getId(), optimizerServiceUrl);
            pythonResult = restClient.post()
                    .uri("/optimization/run")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(optimizerRequest)
                    .retrieve()
                    .body(PythonOptimizationResultDto.class);

            if (pythonResult == null) {
                throw new IllegalStateException("Optimizer service returned empty response");
            }
        } catch (ResourceAccessException ex) {
            log.error("Optimizer service unavailable or timed out for run {}: {}", run.getId(), ex.getMessage());
            run.setStatus("FAILED");
            run.setErrorMessage("Python optimizer service is unavailable or timed out at " + optimizerServiceUrl + ": " + ex.getMessage());
            optimizationRunRepository.save(run);
            throw new ServiceUnavailableException("Python GWO optimizer service is currently unavailable: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Optimization failed for run {}: {}", run.getId(), ex.getMessage());
            run.setStatus("FAILED");
            run.setErrorMessage("Optimization execution failed: " + ex.getMessage());
            optimizationRunRepository.save(run);
            throw new IllegalStateException("Optimization execution failed: " + ex.getMessage(), ex);
        }

        // 6. Persist results in PostgreSQL
        try {
            run.setStatus("COMPLETED");
            run.setInitialFitness(pythonResult.initialFitness());
            run.setFinalFitness(pythonResult.finalFitness());
            if (pythonResult.executionTime() != null) {
                run.setExecutionTime((long) (pythonResult.executionTime() * 1000.0));
            }
            if (pythonResult.convergence() != null) {
                run.setConvergenceHistory(objectMapper.writeValueAsString(pythonResult.convergence()));
            }
            if (pythonResult.fitnessBreakdown() != null) {
                run.setFitnessBreakdown(objectMapper.writeValueAsString(pythonResult.fitnessBreakdown()));
            }

            // 7. Save OptimizedStructure records
            Map<Long, Page> pageMap = pages.stream().collect(Collectors.toMap(Page::getId, p -> p));
            PythonOptimizationResultDto.BestStructureDto bestStruct = pythonResult.bestStructure();

            List<OptimizedStructure> structures = new ArrayList<>();
            if (bestStruct != null && bestStruct.parents() != null) {
                for (Page page : pages) {
                    String pageKey = String.valueOf(page.getId());
                    Long parentId = bestStruct.parents().get(pageKey);
                    Page parentPage = (parentId != null && pageMap.containsKey(parentId)) ? pageMap.get(parentId) : null;
                    Integer pos = (bestStruct.positions() != null) ? bestStruct.positions().getOrDefault(pageKey, 0) : 0;

                    structures.add(new OptimizedStructure(run, page, parentPage, pos));
                }
            }

            optimizedStructureRepository.saveAll(structures);
            run.setStructures(structures);
            run = optimizationRunRepository.save(run);

            log.info("Optimization run {} successfully completed. Final fitness: {}", run.getId(), run.getFinalFitness());
            return mapToRunResponse(run);

        } catch (Exception ex) {
            log.error("Failed to persist optimization results for run {}: {}", run.getId(), ex.getMessage());
            run.setStatus("FAILED");
            run.setErrorMessage("Failed to save results: " + ex.getMessage());
            optimizationRunRepository.save(run);
            throw new IllegalStateException("Failed to persist optimization results: " + ex.getMessage(), ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OptimizationRunResponseDto getOptimizationRun(Long id) {
        OptimizationRun run = findRunById(id);
        return mapToRunResponse(run);
    }

    @Override
    @Transactional(readOnly = true)
    public OptimizationStatusResponseDto getOptimizationStatus(Long id) {
        OptimizationRun run = findRunById(id);
        return new OptimizationStatusResponseDto(
                run.getId(),
                run.getStatus(),
                run.getExecutionTime(),
                run.getErrorMessage()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OptimizationConvergenceResponseDto getOptimizationConvergence(Long id) {
        OptimizationRun run = findRunById(id);
        List<Double> convergence = new ArrayList<>();
        if (run.getConvergenceHistory() != null) {
            try {
                convergence = objectMapper.readValue(
                        run.getConvergenceHistory(),
                        new TypeReference<List<Double>>() {}
                );
            } catch (Exception ex) {
                log.warn("Failed to parse convergence history JSON for run {}: {}", id, ex.getMessage());
            }
        }
        return new OptimizationConvergenceResponseDto(run.getId(), run.getIterations(), convergence);
    }

    @Override
    @Transactional(readOnly = true)
    public OptimizationResultResponseDto getOptimizationResults(Long id) {
        OptimizationRun run = findRunById(id);

        Double initialF = run.getInitialFitness();
        Double finalF = run.getFinalFitness();
        Double improvement = (initialF != null && finalF != null && initialF > 0)
                ? ((initialF - finalF) / initialF) * 100.0
                : 0.0;

        // Parse fitness breakdown
        Map<String, Double> breakdown = new HashMap<>();
        if (run.getFitnessBreakdown() != null) {
            try {
                breakdown = objectMapper.readValue(
                        run.getFitnessBreakdown(),
                        new TypeReference<Map<String, Double>>() {}
                );
            } catch (Exception ex) {
                log.warn("Failed to parse fitness breakdown for run {}: {}", id, ex.getMessage());
            }
        }

        // Parse convergence
        List<Double> convergence = new ArrayList<>();
        if (run.getConvergenceHistory() != null) {
            try {
                convergence = objectMapper.readValue(
                        run.getConvergenceHistory(),
                        new TypeReference<List<Double>>() {}
                );
            } catch (Exception ignored) {}
        }

        // Retrieve optimized structures
        List<OptimizedStructure> structures = optimizedStructureRepository.findByOptimizationRunIdOrderByPositionAsc(id);
        List<OptimizationResultResponseDto.OptimizedNodeDto> nodeDtos = structures.stream().map(s -> {
            Page p = s.getPage();
            Page parent = s.getParentPage();
            return new OptimizationResultResponseDto.OptimizedNodeDto(
                    p.getId(),
                    p.getUrl(),
                    p.getTitle(),
                    parent != null ? parent.getId() : null,
                    parent != null ? parent.getUrl() : null,
                    s.getPosition(),
                    p.getDepth()
            );
        }).toList();

        return new OptimizationResultResponseDto(
                run.getId(),
                run.getWebsite().getId(),
                run.getStatus(),
                initialF,
                finalF,
                improvement,
                run.getExecutionTime(),
                nodeDtos,
                breakdown,
                convergence
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<OptimizationRunResponseDto> getAllOptimizationRuns(Long websiteId) {
        List<OptimizationRun> runs = (websiteId != null)
                ? optimizationRunRepository.findByWebsiteIdOrderByCreatedAtDesc(websiteId)
                : optimizationRunRepository.findAllByOrderByCreatedAtDesc();
        return runs.stream()
                .map(this::mapToRunResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OptimizationRunResponseDto getLatestOptimizationRun(Long websiteId) {
        List<OptimizationRun> runs = optimizationRunRepository.findByWebsiteIdOrderByCreatedAtDesc(websiteId);
        if (runs.isEmpty()) {
            throw new ResourceNotFoundException("OptimizationRun", "websiteId", websiteId);
        }
        return mapToRunResponse(runs.get(0));
    }

    private OptimizationRun findRunById(Long id) {
        return optimizationRunRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OptimizationRun", "id", id));
    }

    private OptimizationRunResponseDto mapToRunResponse(OptimizationRun run) {
        return new OptimizationRunResponseDto(
                run.getId(),
                run.getWebsite().getId(),
                run.getAlgorithm(),
                run.getPopulationSize(),
                run.getIterations(),
                run.getRandomSeed(),
                run.getMaxDepth(),
                run.getMaxChildren(),
                run.getInitialFitness(),
                run.getFinalFitness(),
                run.getExecutionTime(),
                run.getStatus(),
                run.getErrorMessage(),
                run.getCreatedAt()
        );
    }
}
