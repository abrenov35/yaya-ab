/* Yaya — restauration accès recherche Dropbox / OneDrive
   Patch UI non destructif : réaffiche les champs de recherche selon la destination sélectionnée.
   Le moteur de recherche existant (suggestDropboxFolders / suggestOneDriveFolders) reste inchangé.
*/
(function(){
  'use strict';

  function norm(v){ return String(v || '').trim().toUpperCase(); }

  function findDestinationControl(){
    return document.querySelector('[name="destinationClassement"]:checked') ||
           document.querySelector('#destinationClassement') ||
           document.querySelector('[name="destinationClassement"]');
  }

  function setVisible(el, visible){
    if (!el) return;
    el.hidden = !visible;
    el.style.display = visible ? '' : 'none';
    el.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function refreshDdDbSearch(){
    var control = findDestinationControl();
    var value = norm(control && control.value);

    var dbBlock = document.querySelector('#dropboxFolderBlock, [data-destination-block="dropbox"], .dropbox-folder-block');
    var odBlock = document.querySelector('#oneDriveFolderBlock, #onedriveFolderBlock, [data-destination-block="onedrive"], .onedrive-folder-block');

    var wantsDb = value === 'DROPBOX' || value === 'YAYA_DROPBOX' || value.indexOf('DROPBOX') !== -1;
    var wantsOd = value === 'ONEDRIVE' || value === 'YAYA_ONEDRIVE' || value.indexOf('ONEDRIVE') !== -1;

    setVisible(dbBlock, wantsDb);
    setVisible(odBlock, wantsOd);
  }

  document.addEventListener('change', function(e){
    var t = e.target;
    if (!t) return;
    if (t.matches && (t.matches('[name="destinationClassement"]') || t.id === 'destinationClassement')) {
      refreshDdDbSearch();
    }
  });

  document.addEventListener('DOMContentLoaded', function(){
    refreshDdDbSearch();
    new MutationObserver(refreshDdDbSearch).observe(document.body, {childList:true, subtree:true});
  });

  window.refreshDdDbSearch = refreshDdDbSearch;
})();
