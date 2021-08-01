<script lang="ts">
  import { tech } from "./projects";
import { currentProjectView } from "./stores/appStore";

  export let name: string;
  export let label: string;
  export let short: string;
  export let more: string = '';
  export let light: boolean = false;

  export let frontend: string[] = [];
  export let backend: string[] = [];

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

  <img class="project-backdrop" class:light src={`media/showcase/${name}.png`} alt="" />

  <div class="project-content" >

    <!-- Back button up top -->
    <button class="icon" on:click={() => goBack()} >
      <img width="22" src="/media/icons8-back-64.png" alt="" />
      Go back
    </button>

    <!-- Spacing -->
    <div style="height: 12px;" ></div>

    <img class="project-image" src={`media/showcase/${name}.png`} alt="" />

    <!-- Image scroll -->
    <!-- <div class="project-images" >
      <img class="project-image" src={`media/showcase/${name}.png`} />
      <img class="project-image" src={`media/showcase/${name}.png`} />
      <img class="project-image" src={`media/showcase/${name}.png`} />
    </div> -->

    <!-- Spacing -->
    <!-- <div style="height: 12px;" ></div> -->

    <div class="project-details" >
      <h3>{label}</h3>
      <div style="height: 2px;" ></div>
      <h4>{short}</h4>
      <div style="height: 25px;" ></div>
      
      <div class="tech-stack"  >
        <div>
          <p class="tech-stack-label"  >Frontend</p>
          <div class="tech" >
            {#each frontend as _tech} 
              <span>{tech[_tech]}</span>
            {/each}
          </div>
        </div>
        
        {#if backend.length > 0}
          <div>
            <p class="tech-stack-label" >Backend</p>
            <div  class="tech"  >
              {#each backend as _tech} 
                <span> {tech[_tech]} </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      
      
      <!-- <div style="height: 25px;" ></div> -->
      <p >{@html more}</p>

      

       <!-- Repeat back button -->
      <div style="height: 22px;" ></div>
      <button class="icon" on:click={() => goBack()} >
        <img width="22" src="/media/icons8-back-64.png" alt="" />
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

    /* border-radius: 4px; */
    @include Transition((transform, box-shadow));

    &:hover {
      transform: translateY(-4px);
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

      /* bottom: -100%; */

      backdrop-filter: blur(4px);
      /* color: white; */
      /* background-color: rgba(0, 0, 0, 0); */
      background: rgba(39, 51, 59, 0.58);
      /* background: rgba(255, 255, 255, 0.323); */
      /* background: rgba(0, 0, 0, 0.514); */

      /* background-color: rgb(255, 255, 255); */
      /* border-top: 1px solid rgb(221, 221, 221); */
        /* color: rgb(0, 0, 0); */

      @include Transition((background-color, color, bottom), 0.2s, ease);
    }

    &:hover {
      
      .project-preview-label {
      
        /* backdrop-filter: blur(4px); */
        /* background-color: white; */
        /* color: rgb(0, 0, 0); */
        bottom: 0;
      }
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

  .tech-stack {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }

  .tech-stack-label {
    opacity: 0.8;
    margin-bottom: 2px;
  }

  .tech {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    
    span {
      padding: 5px 12px;
      background-color: rgba(94, 94, 94, 0.342);
      border-radius: 4px;
    }

    
  }

  .project {
    position: fixed;
    @include Inset(0);
    padding-top: 1em;
    padding-bottom: 11em;

    background-color: rgb(14, 14, 14);

    pointer-events: none;

    overflow-x: hidden;
    overflow-y: auto;

    z-index: 99999;

    h3 {
      /* transform: translateX(-3px); */
      padding-top: 21px;
    }

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

    &-images {
      display: flex;
      gap: 15px;
      flex-wrap: nowrap;
      overflow-y: hidden;
      padding-bottom: 12px;

      &-image {
        max-width: 65%;
      }
    }

    

    &-details {
      
      /* margin: 0 21px; */
      /* padding: 21px; */

      margin-top: 44px;


      background-color: rgba(63, 63, 63, 0.363);
      background-color: rgb(43, 43, 43);
      border-radius: 6px;

      background-color: rgba(43, 43, 43, 0);
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
      max-width: 1000px;
    }

    &-backdrop {
      position: fixed;
      @include Inset(0);
      bottom: unset;

      width: 100%;
      /* max-width: 950px; */
      max-width: 1150px;
      margin: 0 auto;

      opacity: 0.15;
      filter: blur(40px) saturate(170%);
      transform: scale(1.3, 1.5);
      pointer-events: none;

      &.light {
        opacity: 0.06;
      }
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
      transform: translateY(100px);
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
        transform: translateY(-32px);
        opacity: 1;
      }
    }

  }
</style>