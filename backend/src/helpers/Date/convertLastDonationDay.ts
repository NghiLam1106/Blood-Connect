export function convertLastDonationDays(lastDonation: Date | string | null) {
  if (!lastDonation) return null;

  const donationDate = new Date(lastDonation).getTime();
  const now = Date.now();

  return Math.floor(
    (now - donationDate) / (1000 * 60 * 60 * 24)
  );
};
