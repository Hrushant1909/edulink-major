package com.project.edlink.dto;

import java.util.List;

public class SummarizationResponse {
    private String summary;
    private List<String> topics;
    private List<String> insights;
    private List<String> weakAreas;

    public SummarizationResponse() {
    }

    public SummarizationResponse(String summary, List<String> topics, List<String> insights, List<String> weakAreas) {
        this.summary = summary;
        this.topics = topics;
        this.insights = insights;
        this.weakAreas = weakAreas;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    public List<String> getWeakAreas() {
        return weakAreas;
    }

    public void setWeakAreas(List<String> weakAreas) {
        this.weakAreas = weakAreas;
    }
}
