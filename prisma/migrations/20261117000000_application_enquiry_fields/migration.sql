ALTER TABLE `applications`
  ADD COLUMN `nationality` VARCHAR(80) NULL,
  ADD COLUMN `gender` VARCHAR(30) NULL,
  ADD COLUMN `familyAnnualIncome` VARCHAR(80) NULL,
  ADD COLUMN `referral` VARCHAR(100) NULL,
  ADD COLUMN `referralOther` VARCHAR(160) NULL;
