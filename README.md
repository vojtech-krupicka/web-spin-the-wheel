# web-spin-the-wheel

A simple, mobile-friendly web app for picking a random winner from a list of names — a lottery bowl draw, a spinning wheel, a slot-machine cylinder, or a card carousel.

Work in progress on the `dev` branch — see [CHANGELOG.md](CHANGELOG.md) for what's built so far and [CLAUDE.md](CLAUDE.md) for the current architecture and project state.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- Postgres + [Drizzle ORM](https://orm.drizzle.team/)
- [iron-session](https://github.com/vvo/iron-session) (dashboard passwords) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (password hashing)

## Getting started

Requires [Node.js](https://nodejs.org/) (LTS) and a local Postgres instance.

```bash
# Postgres (once)
docker run --name wheel-db -e POSTGRES_PASSWORD=dev -p 5433:5432 -d postgres:17

# App
cp .env.example .env   # fill in DATABASE_URL / SESSION_SECRET
npm install
npm run db:migrate
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## License

[MIT](LICENSE)
