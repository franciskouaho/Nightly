-- ========================================
-- QUERIES FIREBASE ANALYTICS - NIGHTLY
-- ========================================

-- 1. COMPTE LIÉS PAR JOUR ET PAR MÉTHODE
-- Voir combien d'utilisateurs lient leur compte chaque jour
SELECT
  event_date,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'method') as link_method,
  COUNT(DISTINCT user_pseudo_id) as unique_users,
  COUNT(*) as total_links
FROM
  `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
WHERE
  event_name = 'account_linked'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY
  event_date, link_method
ORDER BY
  event_date DESC;

-- 2. ABONNEMENTS PREMIUM ACCORDÉS
-- Voir combien d'abonnements gratuits ont été accordés
SELECT
  event_date,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'duration_days') as duration_days,
  COUNT(DISTINCT user_pseudo_id) as unique_users,
  COUNT(*) as total_grants
FROM
  `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
WHERE
  event_name = 'premium_granted'
  AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'reason') = 'account_link'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY
  event_date, duration_days
ORDER BY
  event_date DESC;

-- 3. TAUX DE CONVERSION (Anonyme → Lié)
-- Voir le pourcentage d'utilisateurs anonymes qui lient leur compte
WITH anonymous_users AS (
  SELECT
    COUNT(DISTINCT user_pseudo_id) as total_anonymous
  FROM
    `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
  WHERE
    event_name = 'screen_view'
    AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
),
linked_users AS (
  SELECT
    COUNT(DISTINCT user_pseudo_id) as total_linked
  FROM
    `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
  WHERE
    event_name = 'account_linked'
    AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
)
SELECT
  a.total_anonymous,
  l.total_linked,
  ROUND((l.total_linked / a.total_anonymous) * 100, 2) as conversion_rate_percent
FROM
  anonymous_users a,
  linked_users l;

-- 4. DÉTAILS PAR UTILISATEUR
-- Voir qui a lié son compte et quand
SELECT
  user_pseudo_id,
  user_id,
  event_timestamp,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'method') as link_method,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'user_id') as firebase_user_id
FROM
  `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
WHERE
  event_name = 'account_linked'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
ORDER BY
  event_timestamp DESC
LIMIT 100;

-- 5. MÉTHODE DE LIAISON LA PLUS POPULAIRE
-- Voir si les utilisateurs préfèrent Google ou Apple
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'method') as link_method,
  COUNT(*) as total_links,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM
  `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
WHERE
  event_name = 'account_linked'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY
  link_method
ORDER BY
  total_links DESC;

-- 6. TIMELINE DE LIAISONS (Par heure de la journée)
-- Voir à quelle heure les utilisateurs lient leur compte
SELECT
  EXTRACT(HOUR FROM TIMESTAMP_MICROS(event_timestamp)) as hour_of_day,
  COUNT(*) as links_count
FROM
  `YOUR_PROJECT.analytics_YOUR_DATASET.events_*`
WHERE
  event_name = 'account_linked'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY
  hour_of_day
ORDER BY
  hour_of_day;
