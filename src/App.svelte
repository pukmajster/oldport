<script lang="ts">
	import ProjectPreview from "./ProjectPreview.svelte";
	import { projects } from "./projects";
	import { currentProjectView } from "./stores/appStore";

	$: document.body.classList.toggle('noscroll', $currentProjectView != '');
</script>

<div class="background-wrapper" >
	<div class="background" />
</div>

<section class="intro" >
	<h1 style="text-transform: uppercase;" >Žan Pukmajster</h1>

	<h4>Frontend web developer from Slovenia, currently 21 years old.</h4>
</section>

<section>
	<h2>SHOWCASE</h2>
	<h4 class="section-header-sub" >Take a look at some of my work</h4>
	<div class="showcase">
		<ProjectPreview {...projects.skillup} />
		<ProjectPreview {...projects.vgui} />
		<ProjectPreview {...projects.slocraft} />
		<ProjectPreview {...projects.glasbena} />
		<ProjectPreview {...projects.evpis} />
		<ProjectPreview {...projects.bunker} />
		<ProjectPreview {...projects.pud} />
		<ProjectPreview {...projects.lanparty} />
	</div>
</section>

<div style="height: 64px;" ></div>

<style lang="scss" global>
	@import './stylesheets/global.scss';
</style>