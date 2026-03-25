begin;

create index if not exists idx_news_search_vector
  on public.news
  using gin (
    (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(content, '')), 'C')
    )
  );

create index if not exists idx_regulatory_decisions_search_vector
  on public.regulatory_decisions
  using gin (
    (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(summary, '')), 'B')
    )
  );

create index if not exists idx_documents_public_search_vector
  on public.documents
  using gin ((to_tsvector('english', coalesce(file_name, ''))))
  where category = 'public';

create or replace function public.search_public_content(
  search_query text,
  result_limit integer default 10
)
returns table (
  type text,
  title text,
  snippet text,
  url text,
  score real
)
language sql
stable
as $$
  with normalized as (
    select
      trim(coalesce(search_query, '')) as q,
      greatest(1, least(coalesce(result_limit, 10), 50)) as lim
  ),
  tsq as (
    select
      plainto_tsquery('english', q) as query,
      lim
    from normalized
    where q <> ''
  ),
  news_matches as (
    select
      'news'::text as type,
      n.title,
      ts_headline(
        'english',
        coalesce(n.description, n.content, n.title, ''),
        tsq.query,
        'MaxWords=24, MinWords=8, MaxFragments=2, FragmentDelimiter= ... '
      ) as snippet,
      ('/news/' || n.id::text) as url,
      ts_rank_cd(
        (
          setweight(to_tsvector('english', coalesce(n.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(n.description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(n.content, '')), 'C')
        ),
        tsq.query
      )::real as score
    from public.news n
    cross join tsq
    where n.published = true
      and (
        setweight(to_tsvector('english', coalesce(n.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(n.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(n.content, '')), 'C')
      ) @@ tsq.query
  ),
  decision_matches as (
    select
      'decision'::text as type,
      d.title,
      ts_headline(
        'english',
        coalesce(d.summary, d.title, ''),
        tsq.query,
        'MaxWords=24, MinWords=8, MaxFragments=2, FragmentDelimiter= ... '
      ) as snippet,
      coalesce(d.document_url, '/decisions/' || d.id::text) as url,
      ts_rank_cd(
        (
          setweight(to_tsvector('english', coalesce(d.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(d.summary, '')), 'B')
        ),
        tsq.query
      )::real as score
    from public.regulatory_decisions d
    cross join tsq
    where d.is_public = true
      and (
        setweight(to_tsvector('english', coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(d.summary, '')), 'B')
      ) @@ tsq.query
  ),
  document_matches as (
    select
      'document'::text as type,
      d.file_name as title,
      ts_headline(
        'english',
        coalesce(d.file_name, ''),
        tsq.query,
        'MaxWords=12, MinWords=3, MaxFragments=1'
      ) as snippet,
      ('/documents/' || d.id::text) as url,
      ts_rank_cd(
        to_tsvector('english', coalesce(d.file_name, '')),
        tsq.query
      )::real as score
    from public.documents d
    cross join tsq
    where d.category = 'public'
      and d.file_path like 'public/%'
      and to_tsvector('english', coalesce(d.file_name, '')) @@ tsq.query
  ),
  combined as (
    select * from news_matches
    union all
    select * from decision_matches
    union all
    select * from document_matches
  )
  select
    type,
    title,
    snippet,
    url,
    score
  from combined
  order by score desc, title asc
  limit (select lim from tsq limit 1);
$$;

commit;
