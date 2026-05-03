insert into colleges (slug, name, city, state, website, type) values
  ('university-of-florida',         'University of Florida',         'Gainesville',  'FL', 'https://www.ufl.edu',    'public-4yr'),
  ('santa-fe-college',              'Santa Fe College',              'Gainesville',  'FL', 'https://www.sfcollege.edu','community'),
  ('university-of-north-florida',   'University of North Florida',   'Jacksonville', 'FL', 'https://www.unf.edu',    'public-4yr'),
  ('florida-state-university',      'Florida State University',      'Tallahassee',  'FL', 'https://www.fsu.edu',    'public-4yr'),
  ('florida-gateway-college',       'Florida Gateway College',       'Lake City',    'FL', 'https://www.fgc.edu',    'community')
on conflict (slug) do nothing;
