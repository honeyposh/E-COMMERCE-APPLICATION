exports.validatedob = async (req, res, next) => {
  const dobFromBody = req.body && req.body.dateOfBirth;
  const dobFromSet = req.body && req.body.$set && req.body.$set.dateOfBirth;
  const rawDob = dobFromBody || dobFromSet;
  if (!rawDob) {
    return next();
  }
  if (typeof rawDob !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(rawDob)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }
  const [year, month, day] = rawDob.split("-").map(Number);
  const testDate = new Date(Date.UTC(year, month - 1, day)); // <-- UTC creation

  // Calendar validity check using UTC getters
  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() !== month - 1 ||
    testDate.getUTCDate() !== day
  ) {
    return res.status(400).json({ error: "Invalid calendar date" });
  }

  // Past check (compare date-only in UTC)
  const todayUTC = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );
  if (testDate.getTime() >= todayUTC.getTime()) {
    return res.status(400).json({ error: "Date of birth must be in the past" });
  }

  // Replace incoming value with the UTC Date object
  if (dobFromBody) {
    req.body.dateOfBirth = testDate;
  } else if (dobFromSet) {
    req.body.$set.dateOfBirth = testDate;
  }
  next();
};
