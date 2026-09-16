# web-spin-the-wheel

A simple, mobile-friendly web app for picking a random winner from a list of names — as a lottery bowl draw or a spinning wheel.

Work in progress on the `dev` branch.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- Postgres + [Drizzle ORM](https://orm.drizzle.team/)

## Getting started

Requires [Node.js](https://nodejs.org/) (LTS) and a local Postgres instance.

```bash
# Postgres (once)
docker run --name wheel-db -e POSTGRES_PASSWORD=dev -p 5433:5432 -d postgres:17

# App
cp .env.example .env   # fill in DATABASE_URL
npm install
npm run db:migrate
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## License

[MIT](LICENSE)
