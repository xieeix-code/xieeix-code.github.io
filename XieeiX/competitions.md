---
layout: archive
title: "比赛经历"
permalink: /competition/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

这里展示我参与过的学科竞赛与团队赛事。

<div class="competition-grid">
{% assign sorted_competitions = site.competitions | sort: 'date' | reverse %}
{% for post in sorted_competitions %}
  <a href="{{ base_path }}{{ post.url }}" class="competition-card">
    {% if post.header.teaser %}
      <div class="competition-card-image">
        <img src="{{ base_path }}{{ post.header.teaser }}" alt="{{ post.title }}">
      </div>
    {% endif %}
    <div class="competition-card-body">
      <h2 class="competition-card-title">{{ post.title }}</h2>
      {% if post.date %}
        <p class="competition-card-date">{{ post.date | date: "%Y" }}</p>
      {% endif %}
      {% if post.excerpt %}
        <p class="competition-card-excerpt">{{ post.excerpt }}</p>
      {% endif %}
    </div>
  </a>
{% endfor %}
</div>

<style>
.competition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5em;
  margin-top: 2em;
}
.competition-card {
  display: block;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none !important;
  color: inherit !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #fff;
}
.competition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.competition-card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}
.competition-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.competition-card-body {
  padding: 1.2em;
}
.competition-card-title {
  margin: 0 0 0.5em 0;
  font-size: 1.1em;
  line-height: 1.4;
}
.competition-card-date {
  color: #888;
  font-size: 0.9em;
  margin: 0 0 0.6em 0;
}
.competition-card-excerpt {
  margin: 0;
  font-size: 0.95em;
  color: #555;
  line-height: 1.5;
}
</style>