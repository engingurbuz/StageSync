-- cast_roles: şarkı bilgisi (kadro listesinde şarkı adı gösterilebilsin)
ALTER TABLE cast_roles ADD COLUMN IF NOT EXISTS song_id UUID REFERENCES songs(id) ON DELETE SET NULL;
