-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DONOR', 'REQUESTER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT,
    "role" "Role" NOT NULL,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donors" (
    "id" SERIAL NOT NULL,
    "bloodType" TEXT NOT NULL,
    "lastDonation" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "unitBlood" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'UNAVAILABLE',
    "responseRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "licenseCode" TEXT,
    "pathFile" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "donorId" INTEGER NOT NULL,
    "hospitalId" INTEGER NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalAddress" TEXT,
    "distance" DOUBLE PRECISION NOT NULL,
    "urgency" INTEGER NOT NULL,
    "notes" TEXT,
    "isAccept" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Donors_userId_key" ON "Donors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_userId_key" ON "Hospital"("userId");

-- AddForeignKey
ALTER TABLE "Donors" ADD CONSTRAINT "Donors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
