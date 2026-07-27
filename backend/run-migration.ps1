$ErrorActionPreference = "Stop"

mkdir "prisma\migrations\20260619_add_student_user_link" -Force
pnpm prisma migrate diff --from-url "mysql://root:vidyaverse123@127.0.0.1:3308/vidyaverse" --to-schema-datamodel prisma\schema.prisma --script | Out-File -Encoding utf8 "prisma\migrations\20260619_add_student_user_link\migration.sql"

pnpm prisma db execute --file "prisma\migrations\20260619_add_student_user_link\migration.sql" --schema "prisma\schema.prisma"
pnpm prisma migrate resolve --applied 20260619_add_student_user_link

pnpm prisma generate
npx tsx fix-student.ts
pnpm run build
