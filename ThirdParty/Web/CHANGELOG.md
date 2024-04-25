# Changelog
- [v0.0.113](#v0.0.113)
- [v0.0.112](#v0.0.112)
- [v0.0.111](#v0.0.111)

<!-- leaving this here for future reference
<details>
  <summary>Older Releases...</summary>
  <ul>
    <li><a href="#v0.0.111">v0.0.111</a></li>
  </ul>
</details>
-->

------
# v0.0.113 (2024-04-21)
- updated the SelectedClassContextProvider to properly retain state of selected Function or Node (previously a refresh would erase the context)
- implemented styling for dark and light modes (dark mode is now the default)
- created a tailwindUtils.css file to cut down on the verbosity of a few repeated styles across the site
- updated the table of contents to properly smooth scroll now (before it was snapping to the selected section)
- modify function and node URLs to include the class name (needed until breadcrumbs are in place)
- link icon added to functions and nodes to make it clear they route to another page 
- renamed most class, function, and node files to improve clarity about the component they are rendering
- site wide styling updates to improve consistency and readability

# v0.0.112 (2024-04-20)
- updated project config to use 4 spaces instead of 2 (reformatted all files to adjust)
- added LayoutContextProvider to manage the display for the table of contents
- updated styling and layout of Function and Property tables in Class view
- added working table of contents in the Class view to navigate between functions, nodes, and properties
- added a zero state message when no description is provided for a function, node, or property

# v0.0.111 (2024-04-15)
- updated project name instances from `UE Documentable` to `CTRL Documentable`
- refactored types to follow camelCase name convention and group types for better readability
- refactored the SelectedClassContextProvider for better readability
- modified JSON data structure to streamline the variable names (updated corresponding Data Service)
- added new JSON data for testing
- refactored class, function, and node components to accommodate the new changes to the JSON data structure and type declarations

