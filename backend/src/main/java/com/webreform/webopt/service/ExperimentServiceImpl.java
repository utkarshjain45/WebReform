package com.webreform.webopt.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webreform.webopt.dto.*;
import com.webreform.webopt.exception.ResourceNotFoundException;
import com.webreform.webopt.exception.ServiceUnavailableException;
import com.webreform.webopt.model.Experiment;
import com.webreform.webopt.model.ExperimentRun;
import com.webreform.webopt.model.Page;
import com.webreform.webopt.model.PageLink;
import com.webreform.webopt.model.Website;
import com.webreform.webopt.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExperimentServiceImpl implements ExperimentService {

    private static final Logger log = LoggerFactory.getLogger(ExperimentServiceImpl.class);

    private final ExperimentRepository experimentRepository;
    private final ExperimentRunRepository experimentRunRepository;
    private final WebsiteRepository websiteRepository;
    private final PageRepository pageRepository;
    private final PageLinkRepository pageLinkRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String optimizerServiceUrl;

    public ExperimentServiceImpl(
            ExperimentRepository experimentRepository,
            ExperimentRunRepository experimentRunRepository,
            WebsiteRepository websiteRepository,
            PageRepository pageRepository,
            PageLinkRepository pageLinkRepository,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${optimizer.service.url:http://localhost:8000}") String optimizerServiceUrl
    ) {
        this.experimentRepository = experimentRepository;
        this.experimentRunRepository = experimentRunRepository;
        this.websiteRepository = websiteRepository;
        this.pageRepository = pageRepository;
        this.pageLinkRepository = pageLinkRepository;
        this.objectMapper = objectMapper;
        this.optimizerServiceUrl = optimizerServiceUrl;
        this.restClient = restClientBuilder.baseUrl(optimizerServiceUrl).build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExperimentSummaryDto> getAllExperiments() {
        List<Experiment> list = experimentRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(this::mapToSummaryDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ExperimentDetailsDto getExperiment(Long id) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", "id", id));
        List<ExperimentRun> runs = experimentRunRepository.findByExperimentIdOrderByParamValueAsc(id);
        return mapToDetailsDto(experiment, runs);
    }

    @Override
    @Transactional
    public ExperimentDetailsDto runExperimentSuite(CreateExperimentRequestDto request) {
        String type = request.suiteType().toUpperCase().trim();
        Website website = null;
        if (request.websiteId() != null) {
            website = websiteRepository.findById(request.websiteId()).orElse(null);
        }
        if (website == null) {
            List<Website> allSites = websiteRepository.findAll();
            if (!allSites.isEmpty()) {
                website = allSites.get(0);
            }
        }
        if (website == null) {
            throw new IllegalArgumentException("No website registered. Please register and crawl a website first before running benchmark simulations.");
        }

        String suiteName = request.name();
        if (suiteName == null || suiteName.isBlank()) {
            suiteName = switch (type) {
                case "POPULATION_SIZE" -> "Experiment A: Population Size Sweep";
                case "ITERATIONS" -> "Experiment B: Iteration Budget Scaling";
                case "WEBSITE_SIZE" -> "Experiment C: Problem Dimension & Scale";
                case "RANDOM_SEEDS" -> "Experiment D: Stochastic Seed Variance";
                default -> "GWO Research Experiment: " + type;
            };
        }

        String desc = request.description();
        if (desc == null || desc.isBlank()) {
            desc = "Empirical evaluation of GWO metaheuristic for reproducible website structure optimization.";
        }

        Experiment experiment = new Experiment(type, suiteName, desc, website);
        experiment.setStatus("RUNNING");
        experiment = experimentRepository.save(experiment);

        List<ExperimentRun> generatedRuns = new ArrayList<>();

        try {
            switch (type) {
                case "POPULATION_SIZE" -> runPopulationSizeSuite(experiment, website, request, generatedRuns);
                case "ITERATIONS" -> runIterationsSuite(experiment, website, request, generatedRuns);
                case "WEBSITE_SIZE" -> runWebsiteSizeSuite(experiment, website, request, generatedRuns);
                case "RANDOM_SEEDS" -> runRandomSeedsSuite(experiment, website, request, generatedRuns);
                default -> throw new IllegalArgumentException("Unsupported experiment suite type: " + type);
            }

            experiment.setStatus("COMPLETED");

            // Calculate aggregate statistics across runs
            ExperimentStatsDto stats = computeStatistics(generatedRuns);
            experiment.setSummaryMetrics(objectMapper.writeValueAsString(stats));
            experiment = experimentRepository.save(experiment);

            return mapToDetailsDto(experiment, generatedRuns);

        } catch (Exception ex) {
            log.error("Experiment suite {} failed: {}", experiment.getId(), ex.getMessage(), ex);
            experiment.setStatus("FAILED");
            experiment = experimentRepository.save(experiment);
            throw new IllegalStateException("Experiment suite failed: " + ex.getMessage(), ex);
        }
    }

    private void runPopulationSizeSuite(
            Experiment exp, Website site, CreateExperimentRequestDto req, List<ExperimentRun> runs) {
        int[] popSizes = {10, 20, 30, 50, 100};
        int iters = req.baseIterations() != null ? req.baseIterations() : 30;
        int seed = req.baseSeed() != null ? req.baseSeed() : 42;

        var graphData = loadOrCreateGraph(site);

        for (int pop : popSizes) {
            String label = "Pop = " + pop;
            ExperimentRun run = executeSingleRun(
                    exp, label, "population_size", (double) pop,
                    pop, iters, seed, graphData.pages(), graphData.links()
            );
            runs.add(run);
        }
    }

    private void runIterationsSuite(
            Experiment exp, Website site, CreateExperimentRequestDto req, List<ExperimentRun> runs) {
        int[] iterationSteps = {50, 100, 200, 500};
        int pop = req.basePopulationSize() != null ? req.basePopulationSize() : 20;
        int seed = req.baseSeed() != null ? req.baseSeed() : 42;

        var graphData = loadOrCreateGraph(site);

        for (int iters : iterationSteps) {
            String label = "Iters = " + iters;
            ExperimentRun run = executeSingleRun(
                    exp, label, "iterations", (double) iters,
                    pop, iters, seed, graphData.pages(), graphData.links()
            );
            runs.add(run);
        }
    }

    private void runWebsiteSizeSuite(
            Experiment exp, Website site, CreateExperimentRequestDto req, List<ExperimentRun> runs) {
        if (site == null) {
            throw new IllegalArgumentException("Please select a website to run page scale experiments.");
        }
        List<Page> allPages = pageRepository.findByWebsiteId(site.getId());
        if (allPages.size() < 2) {
            throw new IllegalArgumentException("Website '" + site.getName() + "' has only " + allPages.size() + " crawled pages. Please crawl at least 2 pages to test scale simulations.");
        }
        List<PageLink> allLinks = pageLinkRepository.findAllByWebsiteId(site.getId());

        int total = allPages.size();
        List<Integer> stepSizes = new ArrayList<>();
        if (total <= 5) {
            for (int s = 2; s <= total; s++) stepSizes.add(s);
        } else {
            int step = Math.max(2, total / 5);
            for (int s = 2; s <= total; s += step) {
                stepSizes.add(s);
            }
            if (!stepSizes.contains(total)) {
                stepSizes.add(total);
            }
        }

        int pop = 15;
        int iters = req.baseIterations() != null ? req.baseIterations() : 25;
        int seed = req.baseSeed() != null ? req.baseSeed() : 42;

        for (int size : stepSizes) {
            String label = size + " Pages";
            List<Page> subPages = allPages.subList(0, size);
            Set<Long> subPageIds = subPages.stream().map(Page::getId).collect(Collectors.toSet());
            List<PageLink> subLinks = allLinks.stream()
                    .filter(l -> subPageIds.contains(l.getSourcePage().getId()) && subPageIds.contains(l.getTargetPage().getId()))
                    .toList();

            GraphPayload payload = toGraphPayload(subPages, subLinks);
            ExperimentRun run = executeSingleRun(
                    exp, label, "website_size", (double) size,
                    pop, iters, seed, payload.pages(), payload.links()
            );
            runs.add(run);
        }
    }

    private void runRandomSeedsSuite(
            Experiment exp, Website site, CreateExperimentRequestDto req, List<ExperimentRun> runs) {
        int[] seeds = {42, 101, 777, 1337, 2024};
        int pop = req.basePopulationSize() != null ? req.basePopulationSize() : 20;
        int iters = req.baseIterations() != null ? req.baseIterations() : 30;

        var graphData = loadOrCreateGraph(site);

        for (int seed : seeds) {
            String label = "Seed = " + seed;
            ExperimentRun run = executeSingleRun(
                    exp, label, "random_seed", (double) seed,
                    pop, iters, seed, graphData.pages(), graphData.links()
            );
            runs.add(run);
        }
    }

    private ExperimentRun executeSingleRun(
            Experiment exp, String label, String paramName, Double paramVal,
            int popSize, int iters, int seed,
            List<Map<String, Object>> pages, List<Map<String, Object>> links
    ) {
        Map<String, Object> optimizerRequest = new HashMap<>();
        optimizerRequest.put("pages", pages);
        optimizerRequest.put("links", links);
        optimizerRequest.put("population_size", popSize);
        optimizerRequest.put("iterations", iters);
        optimizerRequest.put("max_depth", 3);
        optimizerRequest.put("max_children", 6);
        optimizerRequest.put("random_seed", seed);

        Map<String, Double> weights = Map.of(
                "navigation", 0.35,
                "behavior", 0.25,
                "structural", 0.20,
                "depth", 0.20,
                "semantic", 1.0
        );
        optimizerRequest.put("weights", weights);

        PythonOptimizationResultDto result;
        try {
            result = restClient.post()
                    .uri("/optimization/run")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(optimizerRequest)
                    .retrieve()
                    .body(PythonOptimizationResultDto.class);

            if (result == null) {
                throw new IllegalStateException("Empty response from GWO optimizer");
            }
        } catch (ResourceAccessException ex) {
            throw new ServiceUnavailableException("Optimizer service is unavailable: " + ex.getMessage(), ex);
        }

        ExperimentRun run = new ExperimentRun();
        run.setExperiment(exp);
        run.setRunLabel(label);
        run.setParamName(paramName);
        run.setParamValue(paramVal);
        run.setPopulationSize(popSize);
        run.setIterations(iters);
        run.setRandomSeed(seed);
        run.setNumPages(pages.size());
        run.setInitialFitness(result.initialFitness());
        run.setFinalFitness(result.finalFitness());
        run.setImprovementPercentage(result.improvementPercentage());
        run.setExecutionTimeMs((long) (result.executionTime() * 1000.0));

        // Calculate average depth and max depth from bestStructure
        double avgD = 1.0;
        int maxD = 1;
        if (result.bestStructure() != null && result.bestStructure().depths() != null) {
            var depths = result.bestStructure().depths().values();
            if (!depths.isEmpty()) {
                avgD = depths.stream().mapToInt(Integer::intValue).average().orElse(1.0);
                maxD = depths.stream().mapToInt(Integer::intValue).max().orElse(1);
            }
        }
        run.setAvgDepth(avgD);
        run.setMaxDepth(maxD);

        try {
            if (result.convergence() != null) {
                run.setConvergenceHistory(objectMapper.writeValueAsString(result.convergence()));
            }
            if (result.fitnessBreakdown() != null) {
                run.setFitnessBreakdown(objectMapper.writeValueAsString(result.fitnessBreakdown()));
            }
        } catch (Exception ignored) {}

        return experimentRunRepository.save(run);
    }

    private GraphPayload loadOrCreateGraph(Website site) {
        if (site == null) {
            throw new IllegalArgumentException("Please select a valid website target to run benchmark simulations.");
        }
        List<Page> pages = pageRepository.findByWebsiteId(site.getId());
        if (pages.size() < 2) {
            throw new IllegalArgumentException("Website '" + site.getName() + "' has only " + pages.size() + " crawled page(s). Please crawl at least 2 pages before running benchmark simulations.");
        }
        List<PageLink> links = pageLinkRepository.findAllByWebsiteId(site.getId());
        return toGraphPayload(pages, links);
    }

    private GraphPayload toGraphPayload(List<Page> pages, List<PageLink> links) {
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

        return new GraphPayload(pagesPayload, linksPayload);
    }

    private ExperimentStatsDto computeStatistics(List<ExperimentRun> runs) {
        if (runs == null || runs.isEmpty()) {
            return new ExperimentStatsDto(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0);
        }

        int n = runs.size();
        double sumF = 0.0;
        double bestF = Double.MAX_VALUE;
        double worstF = Double.MIN_VALUE;
        double sumImp = 0.0;
        double sumTime = 0.0;

        for (ExperimentRun r : runs) {
            double f = r.getFinalFitness() != null ? r.getFinalFitness() : 0.0;
            sumF += f;
            if (f < bestF) bestF = f;
            if (f > worstF) worstF = f;
            sumImp += (r.getImprovementPercentage() != null ? r.getImprovementPercentage() : 0.0);
            sumTime += (r.getExecutionTimeMs() != null ? r.getExecutionTimeMs() : 0.0);
        }

        double meanF = sumF / n;
        double meanImp = sumImp / n;
        double meanTime = sumTime / n;

        // Standard deviations
        double sumSqDiffF = 0.0;
        double sumSqDiffTime = 0.0;
        for (ExperimentRun r : runs) {
            double f = r.getFinalFitness() != null ? r.getFinalFitness() : 0.0;
            sumSqDiffF += Math.pow(f - meanF, 2);
            double t = r.getExecutionTimeMs() != null ? r.getExecutionTimeMs() : 0.0;
            sumSqDiffTime += Math.pow(t - meanTime, 2);
        }

        double stdF = Math.sqrt(sumSqDiffF / n);
        double stdTime = Math.sqrt(sumSqDiffTime / n);

        return new ExperimentStatsDto(
                meanF, stdF, bestF, worstF, meanImp, meanTime, stdTime, n
        );
    }

    @Override
    @Transactional(readOnly = true)
    public String exportExperimentCsv(Long id) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", "id", id));
        List<ExperimentRun> runs = experimentRunRepository.findByExperimentIdOrderByParamValueAsc(id);

        StringBuilder sb = new StringBuilder();
        sb.append("experiment_id,suite_type,run_label,param_name,param_value,population_size,iterations,random_seed,num_pages,initial_fitness,final_fitness,improvement_percent,execution_time_ms,avg_depth,max_depth,created_at\n");

        for (ExperimentRun r : runs) {
            sb.append(experiment.getId()).append(",")
                    .append("\"").append(experiment.getSuiteType()).append("\",")
                    .append("\"").append(r.getRunLabel()).append("\",")
                    .append("\"").append(r.getParamName()).append("\",")
                    .append(r.getParamValue()).append(",")
                    .append(r.getPopulationSize()).append(",")
                    .append(r.getIterations()).append(",")
                    .append(r.getRandomSeed()).append(",")
                    .append(r.getNumPages()).append(",")
                    .append(r.getInitialFitness() != null ? r.getInitialFitness() : "").append(",")
                    .append(r.getFinalFitness() != null ? r.getFinalFitness() : "").append(",")
                    .append(r.getImprovementPercentage() != null ? r.getImprovementPercentage() : "").append(",")
                    .append(r.getExecutionTimeMs() != null ? r.getExecutionTimeMs() : "").append(",")
                    .append(r.getAvgDepth() != null ? r.getAvgDepth() : "").append(",")
                    .append(r.getMaxDepth() != null ? r.getMaxDepth() : "").append(",")
                    .append(r.getCreatedAt()).append("\n");
        }

        return sb.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public String exportExperimentJson(Long id) {
        ExperimentDetailsDto details = getExperiment(id);
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(details);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize experiment JSON: " + e.getMessage(), e);
        }
    }

    private ExperimentSummaryDto mapToSummaryDto(Experiment e) {
        List<ExperimentRun> runs = e.getRuns();
        Double bestF = null;
        Double meanF = null;
        Double meanImp = null;
        Double meanTime = null;

        if (e.getSummaryMetrics() != null) {
            try {
                ExperimentStatsDto s = objectMapper.readValue(e.getSummaryMetrics(), ExperimentStatsDto.class);
                bestF = s.bestFitness();
                meanF = s.meanFitness();
                meanImp = s.meanImprovementPercentage();
                meanTime = s.meanExecutionTimeMs();
            } catch (Exception ignored) {}
        }

        return new ExperimentSummaryDto(
                e.getId(),
                e.getSuiteType(),
                e.getName(),
                e.getDescription(),
                e.getWebsite() != null ? e.getWebsite().getId() : null,
                e.getWebsite() != null ? e.getWebsite().getName() : "Synthetic Benchmark Graph",
                e.getStatus(),
                runs != null ? runs.size() : 0,
                bestF,
                meanF,
                meanImp,
                meanTime,
                e.getCreatedAt()
        );
    }

    private ExperimentDetailsDto mapToDetailsDto(Experiment e, List<ExperimentRun> runs) {
        ExperimentStatsDto stats = null;
        if (e.getSummaryMetrics() != null) {
            try {
                stats = objectMapper.readValue(e.getSummaryMetrics(), ExperimentStatsDto.class);
            } catch (Exception ignored) {}
        }
        if (stats == null) {
            stats = computeStatistics(runs);
        }

        List<ExperimentRunDto> runDtos = runs.stream().map(this::mapToRunDto).toList();

        return new ExperimentDetailsDto(
                e.getId(),
                e.getSuiteType(),
                e.getName(),
                e.getDescription(),
                e.getWebsite() != null ? e.getWebsite().getId() : null,
                e.getWebsite() != null ? e.getWebsite().getName() : "Synthetic Benchmark Graph",
                e.getStatus(),
                stats,
                runDtos,
                e.getCreatedAt()
        );
    }

    private ExperimentRunDto mapToRunDto(ExperimentRun r) {
        List<Double> conv = new ArrayList<>();
        if (r.getConvergenceHistory() != null) {
            try {
                conv = objectMapper.readValue(r.getConvergenceHistory(), new TypeReference<List<Double>>() {});
            } catch (Exception ignored) {}
        }

        Map<String, Double> breakdown = new HashMap<>();
        if (r.getFitnessBreakdown() != null) {
            try {
                breakdown = objectMapper.readValue(r.getFitnessBreakdown(), new TypeReference<Map<String, Double>>() {});
            } catch (Exception ignored) {}
        }

        return new ExperimentRunDto(
                r.getId(),
                r.getExperiment().getId(),
                r.getRunLabel(),
                r.getParamName(),
                r.getParamValue(),
                r.getPopulationSize(),
                r.getIterations(),
                r.getRandomSeed(),
                r.getNumPages(),
                r.getInitialFitness(),
                r.getFinalFitness(),
                r.getImprovementPercentage(),
                r.getExecutionTimeMs(),
                r.getAvgDepth(),
                r.getMaxDepth(),
                conv,
                breakdown,
                r.getCreatedAt()
        );
    }

    private record GraphPayload(List<Map<String, Object>> pages, List<Map<String, Object>> links) {}
}
