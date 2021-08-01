<script lang="ts">

</script>

<header>
  <nav>
    <a>ABOUT ME</a>
    <a>SHOWCASE</a>
    <a>ABOUT ME</a>
  </nav>
</header>



<style lang="scss" global>
	@import './stylesheets/global.scss';
	@import './stylesheets/_utils.scss';

  header {

    position: fixed;
    @include Inset(0);
    bottom: unset;
    width: 100vw;

    text-align: left; 
  
    padding-top: 6px;

    backdrop-filter: blur(29px);
  }

  nav {
    display: flex;
    gap: 6px;
  }

  a {
    padding: 10px 21px;
    background-color: rgba(182, 182, 182, 0);

    border-radius: 4px;
    font-weight: 700;

    &:hover {
      background-color: rgba(221, 221, 221, 0.357);
    }
  }

</style>