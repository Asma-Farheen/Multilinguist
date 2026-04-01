'use strict';

/**
 * Component Loader
 * Dynamically injects HTML pieces into the main shell
 */
async function loadComponents() {
  const components = [
    'splash',
    'home',
    'listening',
    'thinking',
    'response',
    'panels'
  ];

  const appShell = document.getElementById('app-shell');
  
  if (!appShell) {
    console.error('App shell not found!');
    return;
  }

  // Load each fragment
  const results = await Promise.allSettled(
    components.map(async (name) => {
      const resp = await fetch(`components/${name}.html`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${name}`);
      const html = await resp.text();
      const div = document.createElement('div');
      div.innerHTML = html;
      // Append all top-level elements from the fragment
      while (div.firstChild) {
        appShell.appendChild(div.firstChild);
      }
    })
  );

  // Check for any failures
  results.forEach((res, i) => {
    if (res.status === 'rejected') {
      console.warn(`Failed to load component: ${components[i]}`, res.reason);
    }
  });

  // After all fragments are injected, start the main app
  if (typeof init === 'function') {
    init();
  } else {
    console.warn('init function not found after loading components');
  }
}

// Start loader on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadComponents);
