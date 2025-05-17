// utils/serverValidation.ts
export const validateProfileData = (profileData: any) => {
  const errors: string[] = [];

  // Full name validation
  if (
    !profileData.full_name ||
    profileData.full_name.length < 5 ||
    profileData.full_name.length > 30
  ) {
    errors.push("Full name must be between 5 and 30 characters");
  }

  // Display name validation
  if (
    !profileData.display_name ||
    profileData.display_name.length < 3 ||
    profileData.display_name.length > 20
  ) {
    errors.push("Display name must be between 3 and 20 characters");
  }

  // Biography validation
  if (
    profileData.biography &&
    (profileData.biography.length < 10 || profileData.biography.length > 500)
  ) {
    errors.push("Biography must be between 10 and 500 characters");
  }

  // Languages validation
  if (profileData.languages) {
    if (
      !Array.isArray(profileData.languages) ||
      profileData.languages.length > 5
    ) {
      errors.push("Maximum 5 languages allowed");
    }
  }

  // Skills validation
  if (profileData.skills) {
    if (
      !Array.isArray(profileData.skills) ||
      profileData.skills.length < 3 ||
      profileData.skills.length > 5
    ) {
      errors.push("Must have between 3 and 5 skills");
    }
  }

  // Genres validation
  if (profileData.preferred_genres) {
    if (
      !Array.isArray(profileData.preferred_genres) ||
      profileData.preferred_genres.length < 3 ||
      profileData.preferred_genres.length > 5
    ) {
      errors.push("Must have between 3 and 5 preferred genres");
    }
  }

  // Software proficiency validation
  if (profileData.software_proficiency) {
    if (
      !Array.isArray(profileData.software_proficiency) ||
      profileData.software_proficiency.length > 5
    ) {
      errors.push("Maximum 5 software proficiencies allowed");
    }
  }

  return errors;
};
