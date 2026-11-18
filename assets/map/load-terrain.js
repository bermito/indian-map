(() => {
  const map = window.CoffeeMap;
  // The HTML state map and keyboard selector work before the 3D layer is ready.
  if (navigator.connection?.saveData || window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    map.fallback();
    return;
  }
  const canvas = document.createElement('canvas');
  const options = {antialias:true, alpha:false};
  let context;
  try { context = canvas.getContext('webgl2', options) || canvas.getContext('webgl', options); }
  catch { /* A disabled graphics context leaves the HTML controls available. */ }
  if (!context) { map.fallback(); return; }
  map.rendererOptions = {...options, canvas, context};
  function load(file) {
    return new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = '/assets/map/' + file;
      script.async = false;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  let fine;
  map.loadDetail = () => {
    fine ||= load('fine-data.js').then(() => true).catch(() => { fine = null; return false; });
    return fine;
  };
  Promise.all(['three.js','overview-data.js','terrain.js'].map(load)).catch(() => map.fallback());
})();
