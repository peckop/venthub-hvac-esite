# Brainstorm: Product Detail Page (PDP) Improvements & "Add to Project" Feature

## 1. Feature: "Add to Project/List"
- **Problem**: Mechanical/Project firms need to group products for specific projects rather than just adding to a single cart.
- **Goal**: Allow users to save products to custom named lists (projects).
- **Proposed Solution**:
  - Add a "Add to Project" button next to "Add to Cart" on the PDP.
  - When clicked, a modal appears to select an existing project or create a new one.
  - Integration with user profile/account to manage these lists.
  - Guest users should be prompted to login or use a limited local list.
- **Technical Considerations**:
  - New Tables: `user_projects` and `project_items`.
  - Hook: `useProjectLists` for CRUD operations.

## 2. Issue: Layout Conflicts (Header vs. Category Band)
- **Problem**: StickyHeader and the local sub-nav/category band in PDP overlap or compete for attention.
- **Proposed Solution**:
  - Use a global CSS variable `--header-height` to sync offsets.
  - Adjust z-index: Header (50), Category Band (40).
  - Add a subtle backdrop-blur and shadow to the Category Band to distinguish it from the header.

## 3. Issue: Design Cleanup (Typography & Buttons)
- **Problem**: Product cards and main details have inconsistent fonts and messy buttons.
- **Proposed Solution**:
  - Standardize on 'Inter' with consistent scale.
  - Update `ProductCard` to use a more modern, cohesive button style.
  - Improve spacing in the PDP Hero section.

## 4. Engineering Standards
- "Geliştirme aşamasındayız": Do not remove sections just because data is currently missing. Keep placeholders or the base structure.
