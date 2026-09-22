package com.webreform.webopt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record GraphAnalysisResponseDto(
        @JsonProperty("graph_statistics")
        GraphStatisticsDto graphStatistics,

        @JsonProperty("page_level_metrics")
        List<PageLevelMetricsDto> pageLevelMetrics,

        String disclaimer
) {

    public record GraphStatisticsDto(
            @JsonProperty("num_pages")
            int numPages,

            @JsonProperty("num_links")
            int numLinks,

            double density,

            @JsonProperty("avg_depth")
            double avgDepth,

            @JsonProperty("max_depth")
            int maxDepth,

            @JsonProperty("dead_end_count")
            int deadEndCount,

            @JsonProperty("orphan_count")
            int orphanCount,

            @JsonProperty("avg_in_degree")
            double avgInDegree,

            @JsonProperty("avg_out_degree")
            double avgOutDegree,

            @JsonProperty("average_path_length")
            Double averagePathLength,

            @JsonProperty("is_strongly_connected")
            boolean isStronglyConnected,

            @JsonProperty("connected_components")
            int connectedComponents
    ) {}

    public record PageLevelMetricsDto(
            @JsonProperty("page_id")
            Long pageId,

            String url,

            @JsonProperty("in_degree")
            int inDegree,

            @JsonProperty("out_degree")
            int outDegree,

            @JsonProperty("depth_from_root")
            Integer depthFromRoot,

            @JsonProperty("is_dead_end")
            boolean isDeadEnd,

            @JsonProperty("is_orphan")
            boolean isOrphan,

            @JsonProperty("is_reachable_from_root")
            boolean isReachableFromRoot,

            @JsonProperty("hub_score")
            double hubScore,

            @JsonProperty("authority_score")
            double authorityScore,

            double pagerank
    ) {}
}
