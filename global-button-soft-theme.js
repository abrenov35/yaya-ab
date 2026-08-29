(function(){
  'use strict';
  const id='yaya-global-button-soft-theme-v1';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    :root{
      --yaya-btn-radius:8px;
      --yaya-btn-border:#d8dee7;
      --yaya-btn-shadow:0 1px 2px rgba(22,45,73,.08),0 2px 7px rgba(22,45,73,.05);
      --yaya-btn-shadow-hover:0 2px 4px rgba(22,45,73,.10),0 4px 10px rgba(22,45,73,.07);
      --yaya-btn-neutral:#f7f9fc;
      --yaya-btn-neutral-border:#d5dde8;
      --yaya-btn-blue:#eef5ff;
      --yaya-btn-blue-border:#cbdcf2;
      --yaya-btn-green:#edf8f1;
      --yaya-btn-green-border:#c8e5d1;
      --yaya-btn-orange:#fff4e8;
      --yaya-btn-orange-border:#f0d2af;
      --yaya-btn-red:#fff0f0;
      --yaya-btn-red-border:#efc7c7;
    }

    button,
    input[type="button"],
    input[type="submit"],
    input[type="reset"],
    .btn,
    .btn2,
    .btnp{
      border-radius:var(--yaya-btn-radius)!important;
      border-width:1px!important;
      border-style:solid!important;
      box-shadow:var(--yaya-btn-shadow)!important;
      font-weight:650!important;
      transition:transform .12s ease,box-shadow .12s ease,background-color .12s ease,border-color .12s ease!important;
      -webkit-tap-highlight-color:transparent;
    }

    button:hover,
    input[type="button"]:hover,
    input[type="submit"]:hover,
    input[type="reset"]:hover,
    .btn:hover,
    .btn2:hover,
    .btnp:hover{
      box-shadow:var(--yaya-btn-shadow-hover)!important;
      transform:translateY(-1px);
    }

    button:active,
    input[type="button"]:active,
    input[type="submit"]:active,
    input[type="reset"]:active,
    .btn:active,
    .btn2:active,
    .btnp:active{
      transform:translateY(0)!important;
      box-shadow:0 1px 2px rgba(22,45,73,.08)!important;
    }

    button:focus-visible,
    input[type="button"]:focus-visible,
    input[type="submit"]:focus-visible,
    input[type="reset"]:focus-visible,
    .btn:focus-visible,
    .btn2:focus-visible,
    .btnp:focus-visible{
      outline:2px solid rgba(74,124,182,.32)!important;
      outline-offset:2px!important;
    }

    button:disabled,
    input[type="button"]:disabled,
    input[type="submit"]:disabled,
    input[type="reset"]:disabled,
    .btn:disabled,
    .btn2:disabled,
    .btnp:disabled{
      box-shadow:none!important;
      transform:none!important;
      opacity:.55;
    }

    .btn2,
    button.secondary,
    button.btn-secondary{
      background:var(--yaya-btn-neutral)!important;
      border-color:var(--yaya-btn-neutral-border)!important;
    }

    .btnp,
    button.primary,
    button.btn-primary{
      background:var(--yaya-btn-blue)!important;
      border-color:var(--yaya-btn-blue-border)!important;
    }

    button.success,
    button.btn-success,
    .btn.success,
    .btn-green{
      background:var(--yaya-btn-green)!important;
      border-color:var(--yaya-btn-green-border)!important;
    }

    button.warning,
    button.btn-warning,
    .btn.warning,
    .btn-orange{
      background:var(--yaya-btn-orange)!important;
      border-color:var(--yaya-btn-orange-border)!important;
    }

    button.danger,
    button.btn-danger,
    .btn.danger,
    .chantier-delete-btn{
      background:var(--yaya-btn-red)!important;
      border-color:var(--yaya-btn-red-border)!important;
    }

    button.icon-btn,
    button.btn-icon,
    button[aria-label]:not([aria-label=""]){
      min-width:30px;
      min-height:30px;
    }

    .toolbar,
    .actions,
    .button-group,
    .btn-group,
    .chantier-fin-toolbar{
      gap:7px;
    }

    @media(max-width:640px){
      button,
      input[type="button"],
      input[type="submit"],
      input[type="reset"],
      .btn,
      .btn2,
      .btnp{
        border-radius:8px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
