# bible-reader
A web application for reading various Bible translations, with lexical and semantic search for passages

# Commands to Run
I'll make a more official README later on in this project, but for now I'm going to record some of the
most common commands to run/setup parts of the project.

### Interacting with Docker Container(s)
~~~
docker compose up -d [container-1 container-2 ...]
docker compose ps
docker compose down
~~~

### Applying Prisma Migrations
~~~
// .../bible-reader/packages/db
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bible_reader" npx prisma migrate dev --name init
~~~

To migrate to production, replace DATABASE_URL with the database connection string and password, and change the command to:
~~~
DATABASE_URL="..." npx prisma migrate deploy --schema=prisma/schema.prisma
~~~

### Seeding the Database
~~~
// .../bible-reader/packages/db
DATABASE_URL="..." npx tsx src/seed.ts
~~~

### Embedding with Ollama
~~~
// .../bible-reader/packages/db
ollama serve
OLLAMA_BASE_URL="http://localhost:11434" DATABASE_URL="..." npx tsx src/embed.ts
~~~