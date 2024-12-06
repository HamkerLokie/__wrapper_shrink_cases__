/**
 * Checks if any child option in the toolbar has exceeded the visible width
 * of the wrapper while shrinking the window.
 * 
 * @param wrapper_width - The available width of the wrapper element.
 * @returns `true` if the last visible option is a child element, `false` otherwise.
 * 
 * Time Complexity: O(n), where `n` is the number of options.
 * Space Complexity: O(1), no additional space is used.
 */
const is_child_reached = useCallback(
  (wrapper_width: number) => {
    return options.some((option, index) => {
      if (!option.children) return false; // Skip options without children
      return (
        toolbar_options_x_coordinates_ref.current[index] >=
        wrapper_width - MIN_GAP_BETWEEN_SCREEN_AND_LAST_ICON
      );
    });
  },
  [options]
);

/**
 * Updates the list of visible options in the toolbar when the window is resized.
 * 
 * - Determines the wrapper's current width.
 * - Filters options based on their coordinates within the wrapper.
 * - Updates the visible options state if they fit within the available width.
 * 
 * Time Complexity: O(n), where `n` is the number of options.
 * Space Complexity: O(n), due to the filtered array of visible options.
 */
const update_display_options_on_window_resize = useCallback(() => {
  const selected_options: BulkActionOptionProps[] = [];

  // Determine the width of the wrapper or fallback to window width
  let wrapper_width = window.innerWidth;
  if (wrapper_ref?.current) {
    wrapper_width = wrapper_ref.current.clientWidth;
  }

  // Exit early if child options are already beyond the wrapper's visible area
  if (is_child_reached(wrapper_width)) {
    return;
  }

  // Calculate how many options can fit within the wrapper's width
  const display_options_count = toolbar_options_x_coordinates_ref.current.filter(
    (x_end_point) =>
      x_end_point <= wrapper_width - MIN_GAP_BETWEEN_SCREEN_AND_LAST_ICON
  ).length;

  // Select options to display, limited by available width and maximum display count
  for (let index = 0; index < display_options_count; index++) {
    if (index >= MAX_OPTIONS_TO_DISPLAY || index >= options.length) break;

    selected_options.push({ ...options[index] });
  }

  set_options_to_be_visible(selected_options);
}, [is_child_reached, options, wrapper_ref, MAX_OPTIONS_TO_DISPLAY]);

/**
 * Calculates and stores the x-coordinates of toolbar options for layout adjustments.
 * - Uses the first element's position as a reference.
 * - Stores adjusted x-coordinates with a minimum gap constant.
 * 
 * Time Complexity: O(n), where `n` is the number of child elements.
 * Space Complexity: O(n), due to the `client_rects_end_point` array.
 */
useLayoutEffect(() => {
  const option_elements =
    toolbar_options_ref.current &&
    [...toolbar_options_ref.current.children]; // Retrieve all child elements

  let first_x = 0;

  // Map over child elements to calculate adjusted end points
  const client_rects_end_point =
    option_elements?.map((option, index) => {
      const rect = option.getBoundingClientRect();
      const { x, width } = rect;
      if (index === 0) {
        first_x = x; // Set reference to the x-coordinate of the first element
      }
      return x + width - first_x + MIN_GAP_BETWEEN_SCREEN_AND_LAST_ICON;
    }) ?? [];

  // Store calculated coordinates if not already initialized
  if (toolbar_options_x_coordinates_ref?.current.length === 0) {
    toolbar_options_x_coordinates_ref.current = client_rects_end_point;
  }
}, [options, options_to_be_visible]);

/**
 * Sets up a resize event listener to dynamically update visible options.
 * Cleans up the listener on component unmount.
 * 
 * Time Complexity: O(1) per event invocation.
 * Space Complexity: O(1), no additional space is used.
 */
useEffect(() => {
  if (toolbar_wrapper_ref?.current) {
    window.addEventListener("resize", update_display_options_on_window_resize);
  }

  return () => {
    window.removeEventListener(
      "resize",
      update_display_options_on_window_resize
    );
  };
}, [options, wrapper_ref, update_display_options_on_window_resize]);

/* -------------------- Final Validations -------------------- */

// Ensure the ref arrays are initialized properly
if (!Array.isArray(toolbar_options_x_coordinates_ref.current)) {
  console.error(
    "Error: toolbar_options_x_coordinates_ref.current is not initialized as an array."
  );
  toolbar_options_x_coordinates_ref.current = [];
}

// Validate MAX_OPTIONS_TO_DISPLAY value
if (MAX_OPTIONS_TO_DISPLAY <= 0) {
  console.warn(
    "Warning: MAX_OPTIONS_TO_DISPLAY should be greater than 0. Current value:",
    MAX_OPTIONS_TO_DISPLAY
  );
}

// Check for invalid or empty options array
if (!Array.isArray(options) || options.length === 0) {
  console.error("Error: The 'options' array is either not initialized or empty.");
}

// Ensure wrapper_ref and toolbar_options_ref are assigned
if (!wrapper_ref?.current) {
  console.warn("Warning: wrapper_ref is not assigned to any DOM element.");
}
if (!toolbar_options_ref?.current) {
  console.warn("Warning: toolbar_options_ref is not assigned to any DOM element.");
}
