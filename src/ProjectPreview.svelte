<script lang="ts">
  import { currentProjectView } from "./stores/appStore";

  export let name: string;
  export let label: string;
  export let short: string;
  export let more: string = '';

  function showDetailsPanel() {
    currentProjectView.set(name);
  }

  function goBack() {
    currentProjectView.set('');
  }

  $: showFullProjectDetails = $currentProjectView == name;
</script>

  
<div class="project-preview" on:click={() => showDetailsPanel()}>
  <img class="project-preview-image" class:fullscreen={showFullProjectDetails} src={`media/showcase/${name}.png`} />
  <div class="project-preview-label" >
    <h4>{label}</h4>
    <p>{short}</p>
  </div>
</div>

<!-- <img class="backdrop" class:showFullProjectDetails src={`media/showcase/${name}.png`} /> -->

<div class="project" class:showFullProjectDetails  >

  <div class="project-content" >

    <!-- Back button up top -->
    <button class="icon" on:click={() => goBack()} >
      <img width="22" src="/media/icons8-back-64.png" />
      Go back
    </button>

    <div style="height: 12px;" ></div>
    <img class="project-image" src={`media/showcase/${name}.png`} />

    <div class="project-details" >
      <h3>{label}</h3>
      <div style="height: 2px;" ></div>
      <h4>{short}</h4>
      <div style="height: 25px;" ></div>
      <p>{more}</p>

       <!-- Repeat back button -->
      <div style="height: 42px;" ></div>
      <button class="icon" on:click={() => goBack()} >
        <img width="22" src="/media/icons8-back-64.png" />
        Go back
      </button>
    </div>  
  </div>
</div>

<style lang="scss" >
	@import './stylesheets/_utils.scss';
  
  .project-preview {
    display: flex;
    flex-direction: column;
    position: relative;

    cursor: pointer;
    overflow: hidden;

    border-radius: 4px;
    @include Transition((transform, box-shadow));

    &:hover {
      transform: translateY(-5px);
      box-shadow: rgba(14, 30, 37, 0.22) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
    }

    &-image {
      max-width: 100%;
      background-size: contain;
      height: 100%;

      .fullscreen {
        position: fixed;
      }
    }

    &-label {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px;

      backdrop-filter: blur(5px);
      background: rgba(39, 51, 59, 0.58);
    }
  }

  .backdrop {
      position: fixed;
      @include Inset(0);

      width: 100vw;
      height: 100vh;

      z-index: 9999;

      filter: blur(25px);
      opacity: 0;

      pointer-events: none;
      transform: scale(1.6);

      &.showFullProjectDetails {
        opacity: 1;
      } 
    }

  .project {
    position: fixed;
    @include Inset(0);
    padding-top: 1em;

    background-color: rgb(14, 14, 14);

    pointer-events: none;

    overflow: auto;

    z-index: 99999;

    &-top {
      grid-template-columns: 400px 1fr;
      gap: 25px;
    }


    &-image-wrapper {
      max-width: 100%;
      max-height: 600px;

      overflow: hidden;
    }

    &-image {
      max-width: 100%;
      width: 100%;

      border-radius: 7px;

      object-fit: contain;
      
    }

    &-details {

      margin-top: 1em;
    }

    h2 {
      margin-bottom: 2rem;
    }

    &.showFullProjectDetails {
      pointer-events: all;
      /* backdrop-filter: blur(25px); */

      z-index: 99999;
    }

    &-content {
      padding: 25px;
      margin: 0 auto;
      max-width: 1100px;
    }
  }


  /* TRANSITIONS */
  .project {

    opacity: 0;

    @include Transition((transform, opacity), 0.2s, ease);

    &-image {
      transform: translateX(-100px);
      opacity: 0;

      @include Transition((transform, opacity), 0.2s, ease);
      transition-delay: 0.04s;
    }

    &-details {
      transform: translateY(100PX);
      opacity: 0;

      @include Transition((transform, opacity), 0.2s, ease);
      transition-delay: 0.08s;
    }

    &.showFullProjectDetails {
      transform: translateX(0);
      opacity: 1;

      .project-image {
        transform: translateX(0);
        opacity: 1;
      }
      .project-details {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
</style>