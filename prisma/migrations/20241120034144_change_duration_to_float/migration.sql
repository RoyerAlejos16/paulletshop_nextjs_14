-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "service" TEXT NOT NULL,
    "duration" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'solicitado',
    "number" TEXT,
    "name" TEXT
);
