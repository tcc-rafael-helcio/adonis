.PHONY: seed migrate dev

all:
	pnpm run dev

seed:
	pnpm --filter web exec node ace db:seed

migrate:
	pnpm --filter web exec node ace migration:run

reset:
	docker compose down -v
	docker compose up -d