-- cast_roles: production_id opsiyonel (prodüksiyon kullanılmıyorsa kadroya aktarım yine yapılabilsin)
ALTER TABLE cast_roles ALTER COLUMN production_id DROP NOT NULL;