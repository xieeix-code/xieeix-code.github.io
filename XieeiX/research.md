---
layout: archive
title: "科研经历"
permalink: /research/
author_profile: true
---

{% include base_path %}

这里展示我参与的研究与竞赛项目。点击任一项目查看详细介绍。

<div class="research-list">
{% assign sorted_research = site.research | sort: 'date' | reverse %}
{% for post in sorted_research %}
  <div class="research-item">
    {% if post.header.teaser %}
      <a href="{{ base_path }}{{ post.url }}">
        <img src="{{ base_path }}{{ post.header.teaser }}" 
             alt="{{ post.title }}" 
             class="research-teaser">
      </a>
    {% endif %}
    <div class="research-content">
      <h2><a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a></h2>
      {% if post.date %}
        <p class="page__date">📅 {{ post.date | date: "%Y-%m-%d" }}</p>
      {% endif %}
      {% if post.excerpt %}
        <p>{{ post.excerpt }}</p>
      {% endif %}
    </div>
  </div>
{% endfor %}
</div>

<style>
.research-list {
  margin-top: 2em;
}
.research-item {
  display: flex;
  gap: 1.5em;
  margin-bottom: 2em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid #eee;
  align-items: flex-start;
}
.research-teaser {
  width: 200px;
  height: auto;
  flex-shrink: 0;
  border-radius: 4px;
  object-fit: cover;
}
.research-content {
  flex: 1;
}
.research-content h2 {
  margin-top: 0;
}
@media (max-width: 600px) {
  .research-item {
    flex-direction: column;
  }
  .research-teaser {
    width: 100%;
  }
}
</style>