
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const tech = {
        react: 'React',
        svelte: 'Svelte',
        'react-router': 'React Router',
        'vanilla-js': 'Vanilla JS',
        js: 'JavaScript',
        ts: 'TypeScript',
        scss: 'SCSS',
        mui: 'Material UI',
        carbon: 'Carbon UI',
        node: 'NodeJS',
        express: 'Express',
        nunjucks: 'Nunjucks',
        sequelize: 'Sequelize',
        firebase: 'Firebase'
    };
    const projects = {
        skillup: {
            name: 'skillup',
            label: 'SkillUp Mentor',
            short: 'Developer bootcamp landing page',
            frontend: ['react', 'ts', 'scss']
        },
        vgui: {
            name: 'vgui',
            label: 'VGUI Inspector',
            short: 'Tool for inspecting Valve\'s VGUI elements',
            more: 'While trying to work with Valve\'s proprietary UI system when modding their game Left4Dead, visaulizing layouts was incredibly frustrating, even more so because the are no tools for conveniently previewing layouts either. I took it upon myself to make this little app that not only lets you preview the UI, but also modify it and see changes on the fly. Later on I also added some (very) rough support for inspecting Respawn Entertainments\'s own version of VGUI used in TitanFall and Apex Legends.',
            frontend: ['svelte', 'ts', 'carbon', 'scss']
        },
        slocraft: {
            name: 'slocraft',
            label: 'Slocraft',
            short: 'Slovenian Minecraft server landing page',
            more: `I was approached by some friends to make a landing page for their Minecraft server, and I was happy to help.`,
            frontend: ['svelte', 'ts', 'scss']
        },
        glasbena: {
            name: 'glasbena',
            label: 'Dan Opdrtih Vrat',
            short: 'Event page for music school',
            more: 'A video-oriented site that guides the viewer through various instruments',
            frontend: ['react', 'ts', 'scss']
        },
        evpis: {
            name: 'evpis',
            label: 'ŠCV eVpis',
            short: 'High school sign up form',
            more: 'Sign up form for students for the entire high school of Velenje, also featuring an admin dashboard.',
            frontend: ['react', 'ts', 'mui'],
            backend: ['firebase']
        },
        bunker: {
            name: 'bunker',
            label: 'Bunker',
            short: 'Browser startpage',
            more: 'Custom browser startpage I made in my spare time. I was inspired by other startpages I discovered on reddit (r/startpages), so I made my own!',
            frontend: ['vanilla-js', 'scss']
        },
        pud: {
            name: 'pud',
            label: 'PUD',
            short: 'High school document solution',
            more: 'The digital solution to my school\'s problem of physical documents. Allows students to upload various documents that the school can then easily view and provide feedback directly to the student in a quick and easy manner. Not only was this my first big project, it was also my first time using the React library, along with it being my first project in the freelancing world. While the first versions of this product suffered from my inexperience, I learned a lot about modern web development from this one project alone, not just on the frontend, but on the backend aswell.',
            frontend: ['react', 'react-router', 'js', 'mui', 'scss'],
            backend: ['node', 'express', 'ts', 'sequelize']
        },
        lanparty: {
            name: 'lanparty',
            label: 'ERŠ Lan Party',
            short: 'High school lan party landing page',
            more: 'A very simple site that was used as the landing page for my high school\'s annual LAN Party event in 2020 and 2021.',
            frontend: ['vanilla-js', 'scss'],
            backend: ['node', 'express', 'nunjucks']
        },
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const currentProjectView = writable('');

    /* src\ProjectPreview.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\ProjectPreview.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (65:12) {#each frontend as _tech}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = tech[/*_tech*/ ctx[13]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-17b5obn");
    			add_location(span, file$1, 65, 14, 2034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*frontend*/ 16 && t_value !== (t_value = tech[/*_tech*/ ctx[13]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(65:12) {#each frontend as _tech}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if backend.length > 0}
    function create_if_block(ctx) {
    	let div1;
    	let p;
    	let t1;
    	let div0;
    	let each_value = /*backend*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Backend";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "tech-stack-label svelte-17b5obn");
    			add_location(p, file$1, 72, 12, 2190);
    			attr_dev(div0, "class", "tech svelte-17b5obn");
    			add_location(div0, file$1, 73, 12, 2244);
    			add_location(div1, file$1, 71, 10, 2171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tech, backend*/ 32) {
    				each_value = /*backend*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(71:8) {#if backend.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (75:14) {#each backend as _tech}
    function create_each_block(ctx) {
    	let span;
    	let t0_value = tech[/*_tech*/ ctx[13]] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "svelte-17b5obn");
    			add_location(span, file$1, 75, 16, 2324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*backend*/ 32 && t0_value !== (t0_value = tech[/*_tech*/ ctx[13]] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(75:14) {#each backend as _tech}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let h40;
    	let t1;
    	let t2;
    	let p0;
    	let t3;
    	let t4;
    	let div12;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div11;
    	let button0;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let t7;
    	let div2;
    	let t8;
    	let img3;
    	let img3_src_value;
    	let t9;
    	let div3;
    	let t10;
    	let div10;
    	let h3;
    	let t11;
    	let t12;
    	let div4;
    	let t13;
    	let h41;
    	let t14;
    	let t15;
    	let div5;
    	let t16;
    	let div8;
    	let div7;
    	let p1;
    	let t18;
    	let div6;
    	let t19;
    	let t20;
    	let p2;
    	let t21;
    	let t22;
    	let div9;
    	let t23;
    	let button1;
    	let img4;
    	let img4_src_value;
    	let t24;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*frontend*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block = /*backend*/ ctx[5].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			h40 = element("h4");
    			t1 = text(/*label*/ ctx[1]);
    			t2 = space();
    			p0 = element("p");
    			t3 = text(/*short*/ ctx[2]);
    			t4 = space();
    			div12 = element("div");
    			img1 = element("img");
    			t5 = space();
    			div11 = element("div");
    			button0 = element("button");
    			img2 = element("img");
    			t6 = text("\r\n      Go back");
    			t7 = space();
    			div2 = element("div");
    			t8 = space();
    			img3 = element("img");
    			t9 = space();
    			div3 = element("div");
    			t10 = space();
    			div10 = element("div");
    			h3 = element("h3");
    			t11 = text(/*label*/ ctx[1]);
    			t12 = space();
    			div4 = element("div");
    			t13 = space();
    			h41 = element("h4");
    			t14 = text(/*short*/ ctx[2]);
    			t15 = space();
    			div5 = element("div");
    			t16 = space();
    			div8 = element("div");
    			div7 = element("div");
    			p1 = element("p");
    			p1.textContent = "Frontend";
    			t18 = space();
    			div6 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t19 = space();
    			if (if_block) if_block.c();
    			t20 = space();
    			p2 = element("p");
    			t21 = text(/*more*/ ctx[3]);
    			t22 = space();
    			div9 = element("div");
    			t23 = space();
    			button1 = element("button");
    			img4 = element("img");
    			t24 = text("\r\n        Go back");
    			attr_dev(img0, "class", "project-preview-image svelte-17b5obn");
    			if (img0.src !== (img0_src_value = `media/showcase/${/*name*/ ctx[0]}.png`)) attr_dev(img0, "src", img0_src_value);
    			toggle_class(img0, "fullscreen", /*showFullProjectDetails*/ ctx[6]);
    			add_location(img0, file$1, 18, 2, 509);
    			add_location(h40, file$1, 20, 4, 669);
    			add_location(p0, file$1, 21, 4, 691);
    			attr_dev(div0, "class", "project-preview-label svelte-17b5obn");
    			add_location(div0, file$1, 19, 2, 627);
    			attr_dev(div1, "class", "project-preview svelte-17b5obn");
    			add_location(div1, file$1, 17, 0, 440);
    			attr_dev(img1, "class", "project-backdrop svelte-17b5obn");
    			if (img1.src !== (img1_src_value = `media/showcase/${/*name*/ ctx[0]}.png`)) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$1, 29, 2, 886);
    			attr_dev(img2, "width", "22");
    			if (img2.src !== (img2_src_value = "/media/icons8-back-64.png")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$1, 35, 6, 1086);
    			attr_dev(button0, "class", "icon");
    			add_location(button0, file$1, 34, 4, 1030);
    			set_style(div2, "height", "12px");
    			add_location(div2, file$1, 40, 4, 1196);
    			attr_dev(img3, "class", "project-image svelte-17b5obn");
    			if (img3.src !== (img3_src_value = `media/showcase/${/*name*/ ctx[0]}.png`)) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$1, 42, 4, 1238);
    			set_style(div3, "height", "12px");
    			add_location(div3, file$1, 52, 4, 1633);
    			add_location(h3, file$1, 55, 6, 1713);
    			set_style(div4, "height", "2px");
    			add_location(div4, file$1, 56, 6, 1737);
    			add_location(h41, file$1, 57, 6, 1778);
    			set_style(div5, "height", "25px");
    			add_location(div5, file$1, 58, 6, 1802);
    			attr_dev(p1, "class", "tech-stack-label svelte-17b5obn");
    			add_location(p1, file$1, 62, 10, 1905);
    			attr_dev(div6, "class", "tech svelte-17b5obn");
    			add_location(div6, file$1, 63, 10, 1959);
    			add_location(div7, file$1, 61, 8, 1888);
    			attr_dev(div8, "class", "tech-stack svelte-17b5obn");
    			add_location(div8, file$1, 60, 6, 1852);
    			add_location(p2, file$1, 84, 6, 2517);
    			set_style(div9, "height", "22px");
    			add_location(div9, file$1, 89, 6, 2586);
    			attr_dev(img4, "width", "22");
    			if (img4.src !== (img4_src_value = "/media/icons8-back-64.png")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$1, 91, 8, 2686);
    			attr_dev(button1, "class", "icon");
    			add_location(button1, file$1, 90, 6, 2628);
    			attr_dev(div10, "class", "project-details svelte-17b5obn");
    			add_location(div10, file$1, 54, 4, 1675);
    			attr_dev(div11, "class", "project-content svelte-17b5obn");
    			add_location(div11, file$1, 31, 2, 959);
    			attr_dev(div12, "class", "project svelte-17b5obn");
    			toggle_class(div12, "showFullProjectDetails", /*showFullProjectDetails*/ ctx[6]);
    			add_location(div12, file$1, 27, 0, 828);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h40);
    			append_dev(h40, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, img1);
    			append_dev(div12, t5);
    			append_dev(div12, div11);
    			append_dev(div11, button0);
    			append_dev(button0, img2);
    			append_dev(button0, t6);
    			append_dev(div11, t7);
    			append_dev(div11, div2);
    			append_dev(div11, t8);
    			append_dev(div11, img3);
    			append_dev(div11, t9);
    			append_dev(div11, div3);
    			append_dev(div11, t10);
    			append_dev(div11, div10);
    			append_dev(div10, h3);
    			append_dev(h3, t11);
    			append_dev(div10, t12);
    			append_dev(div10, div4);
    			append_dev(div10, t13);
    			append_dev(div10, h41);
    			append_dev(h41, t14);
    			append_dev(div10, t15);
    			append_dev(div10, div5);
    			append_dev(div10, t16);
    			append_dev(div10, div8);
    			append_dev(div8, div7);
    			append_dev(div7, p1);
    			append_dev(div7, t18);
    			append_dev(div7, div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			append_dev(div8, t19);
    			if (if_block) if_block.m(div8, null);
    			append_dev(div10, t20);
    			append_dev(div10, p2);
    			append_dev(p2, t21);
    			append_dev(div10, t22);
    			append_dev(div10, div9);
    			append_dev(div10, t23);
    			append_dev(div10, button1);
    			append_dev(button1, img4);
    			append_dev(button1, t24);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[11], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && img0.src !== (img0_src_value = `media/showcase/${/*name*/ ctx[0]}.png`)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*showFullProjectDetails*/ 64) {
    				toggle_class(img0, "fullscreen", /*showFullProjectDetails*/ ctx[6]);
    			}

    			if (dirty & /*label*/ 2) set_data_dev(t1, /*label*/ ctx[1]);
    			if (dirty & /*short*/ 4) set_data_dev(t3, /*short*/ ctx[2]);

    			if (dirty & /*name*/ 1 && img1.src !== (img1_src_value = `media/showcase/${/*name*/ ctx[0]}.png`)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*name*/ 1 && img3.src !== (img3_src_value = `media/showcase/${/*name*/ ctx[0]}.png`)) {
    				attr_dev(img3, "src", img3_src_value);
    			}

    			if (dirty & /*label*/ 2) set_data_dev(t11, /*label*/ ctx[1]);
    			if (dirty & /*short*/ 4) set_data_dev(t14, /*short*/ ctx[2]);

    			if (dirty & /*tech, frontend*/ 16) {
    				each_value_1 = /*frontend*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*backend*/ ctx[5].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div8, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*more*/ 8) set_data_dev(t21, /*more*/ ctx[3]);

    			if (dirty & /*showFullProjectDetails*/ 64) {
    				toggle_class(div12, "showFullProjectDetails", /*showFullProjectDetails*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div12);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let showFullProjectDetails;
    	let $currentProjectView;
    	validate_store(currentProjectView, "currentProjectView");
    	component_subscribe($$self, currentProjectView, $$value => $$invalidate(9, $currentProjectView = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectPreview", slots, []);
    	let { name } = $$props;
    	let { label } = $$props;
    	let { short } = $$props;
    	let { more = "" } = $$props;
    	let { frontend = [] } = $$props;
    	let { backend = [] } = $$props;

    	function showDetailsPanel() {
    		currentProjectView.set(name);
    	}

    	function goBack() {
    		currentProjectView.set("");
    	}

    	const writable_props = ["name", "label", "short", "more", "frontend", "backend"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectPreview> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => showDetailsPanel();
    	const click_handler_1 = () => goBack();
    	const click_handler_2 = () => goBack();

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("short" in $$props) $$invalidate(2, short = $$props.short);
    		if ("more" in $$props) $$invalidate(3, more = $$props.more);
    		if ("frontend" in $$props) $$invalidate(4, frontend = $$props.frontend);
    		if ("backend" in $$props) $$invalidate(5, backend = $$props.backend);
    	};

    	$$self.$capture_state = () => ({
    		tech,
    		currentProjectView,
    		name,
    		label,
    		short,
    		more,
    		frontend,
    		backend,
    		showDetailsPanel,
    		goBack,
    		showFullProjectDetails,
    		$currentProjectView
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("short" in $$props) $$invalidate(2, short = $$props.short);
    		if ("more" in $$props) $$invalidate(3, more = $$props.more);
    		if ("frontend" in $$props) $$invalidate(4, frontend = $$props.frontend);
    		if ("backend" in $$props) $$invalidate(5, backend = $$props.backend);
    		if ("showFullProjectDetails" in $$props) $$invalidate(6, showFullProjectDetails = $$props.showFullProjectDetails);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentProjectView, name*/ 513) {
    			$$invalidate(6, showFullProjectDetails = $currentProjectView == name);
    		}
    	};

    	return [
    		name,
    		label,
    		short,
    		more,
    		frontend,
    		backend,
    		showFullProjectDetails,
    		showDetailsPanel,
    		goBack,
    		$currentProjectView,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class ProjectPreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			name: 0,
    			label: 1,
    			short: 2,
    			more: 3,
    			frontend: 4,
    			backend: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectPreview",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<ProjectPreview> was created without expected prop 'name'");
    		}

    		if (/*label*/ ctx[1] === undefined && !("label" in props)) {
    			console.warn("<ProjectPreview> was created without expected prop 'label'");
    		}

    		if (/*short*/ ctx[2] === undefined && !("short" in props)) {
    			console.warn("<ProjectPreview> was created without expected prop 'short'");
    		}
    	}

    	get name() {
    		throw new Error("<ProjectPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ProjectPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<ProjectPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<ProjectPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get short() {
    		throw new Error("<ProjectPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<ProjectPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get more() {
    		throw new Error("<ProjectPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set more(value) {
    		throw new Error("<ProjectPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frontend() {
    		throw new Error("<ProjectPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frontend(value) {
    		throw new Error("<ProjectPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backend() {
    		throw new Error("<ProjectPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backend(value) {
    		throw new Error("<ProjectPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let section0;
    	let h1;
    	let t2;
    	let h40;
    	let t4;
    	let section1;
    	let h2;
    	let t6;
    	let h41;
    	let t8;
    	let div2;
    	let projectpreview0;
    	let t9;
    	let projectpreview1;
    	let t10;
    	let projectpreview2;
    	let t11;
    	let projectpreview3;
    	let t12;
    	let projectpreview4;
    	let t13;
    	let projectpreview5;
    	let t14;
    	let projectpreview6;
    	let t15;
    	let projectpreview7;
    	let t16;
    	let div3;
    	let current;
    	const projectpreview0_spread_levels = [projects.skillup];
    	let projectpreview0_props = {};

    	for (let i = 0; i < projectpreview0_spread_levels.length; i += 1) {
    		projectpreview0_props = assign(projectpreview0_props, projectpreview0_spread_levels[i]);
    	}

    	projectpreview0 = new ProjectPreview({
    			props: projectpreview0_props,
    			$$inline: true
    		});

    	const projectpreview1_spread_levels = [projects.vgui];
    	let projectpreview1_props = {};

    	for (let i = 0; i < projectpreview1_spread_levels.length; i += 1) {
    		projectpreview1_props = assign(projectpreview1_props, projectpreview1_spread_levels[i]);
    	}

    	projectpreview1 = new ProjectPreview({
    			props: projectpreview1_props,
    			$$inline: true
    		});

    	const projectpreview2_spread_levels = [projects.slocraft];
    	let projectpreview2_props = {};

    	for (let i = 0; i < projectpreview2_spread_levels.length; i += 1) {
    		projectpreview2_props = assign(projectpreview2_props, projectpreview2_spread_levels[i]);
    	}

    	projectpreview2 = new ProjectPreview({
    			props: projectpreview2_props,
    			$$inline: true
    		});

    	const projectpreview3_spread_levels = [projects.glasbena];
    	let projectpreview3_props = {};

    	for (let i = 0; i < projectpreview3_spread_levels.length; i += 1) {
    		projectpreview3_props = assign(projectpreview3_props, projectpreview3_spread_levels[i]);
    	}

    	projectpreview3 = new ProjectPreview({
    			props: projectpreview3_props,
    			$$inline: true
    		});

    	const projectpreview4_spread_levels = [projects.evpis];
    	let projectpreview4_props = {};

    	for (let i = 0; i < projectpreview4_spread_levels.length; i += 1) {
    		projectpreview4_props = assign(projectpreview4_props, projectpreview4_spread_levels[i]);
    	}

    	projectpreview4 = new ProjectPreview({
    			props: projectpreview4_props,
    			$$inline: true
    		});

    	const projectpreview5_spread_levels = [projects.bunker];
    	let projectpreview5_props = {};

    	for (let i = 0; i < projectpreview5_spread_levels.length; i += 1) {
    		projectpreview5_props = assign(projectpreview5_props, projectpreview5_spread_levels[i]);
    	}

    	projectpreview5 = new ProjectPreview({
    			props: projectpreview5_props,
    			$$inline: true
    		});

    	const projectpreview6_spread_levels = [projects.pud];
    	let projectpreview6_props = {};

    	for (let i = 0; i < projectpreview6_spread_levels.length; i += 1) {
    		projectpreview6_props = assign(projectpreview6_props, projectpreview6_spread_levels[i]);
    	}

    	projectpreview6 = new ProjectPreview({
    			props: projectpreview6_props,
    			$$inline: true
    		});

    	const projectpreview7_spread_levels = [projects.lanparty];
    	let projectpreview7_props = {};

    	for (let i = 0; i < projectpreview7_spread_levels.length; i += 1) {
    		projectpreview7_props = assign(projectpreview7_props, projectpreview7_spread_levels[i]);
    	}

    	projectpreview7 = new ProjectPreview({
    			props: projectpreview7_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			section0 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Žan Pukmajster";
    			t2 = space();
    			h40 = element("h4");
    			h40.textContent = "Frontend web developer from Slovenia, currently 21 years old.";
    			t4 = space();
    			section1 = element("section");
    			h2 = element("h2");
    			h2.textContent = "SHOWCASE";
    			t6 = space();
    			h41 = element("h4");
    			h41.textContent = "Take a look at some of my work";
    			t8 = space();
    			div2 = element("div");
    			create_component(projectpreview0.$$.fragment);
    			t9 = space();
    			create_component(projectpreview1.$$.fragment);
    			t10 = space();
    			create_component(projectpreview2.$$.fragment);
    			t11 = space();
    			create_component(projectpreview3.$$.fragment);
    			t12 = space();
    			create_component(projectpreview4.$$.fragment);
    			t13 = space();
    			create_component(projectpreview5.$$.fragment);
    			t14 = space();
    			create_component(projectpreview6.$$.fragment);
    			t15 = space();
    			create_component(projectpreview7.$$.fragment);
    			t16 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "background");
    			add_location(div0, file, 7, 1, 291);
    			attr_dev(div1, "class", "background-wrapper");
    			add_location(div1, file, 6, 0, 256);
    			set_style(h1, "text-transform", "uppercase");
    			add_location(h1, file, 11, 1, 352);
    			add_location(h40, file, 13, 1, 414);
    			attr_dev(section0, "class", "intro");
    			add_location(section0, file, 10, 0, 326);
    			add_location(h2, file, 17, 1, 508);
    			attr_dev(h41, "class", "section-header-sub");
    			add_location(h41, file, 18, 1, 527);
    			attr_dev(div2, "class", "showcase");
    			add_location(div2, file, 19, 1, 596);
    			add_location(section1, file, 16, 0, 497);
    			set_style(div3, "height", "64px");
    			add_location(div3, file, 31, 0, 976);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h1);
    			append_dev(section0, t2);
    			append_dev(section0, h40);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h2);
    			append_dev(section1, t6);
    			append_dev(section1, h41);
    			append_dev(section1, t8);
    			append_dev(section1, div2);
    			mount_component(projectpreview0, div2, null);
    			append_dev(div2, t9);
    			mount_component(projectpreview1, div2, null);
    			append_dev(div2, t10);
    			mount_component(projectpreview2, div2, null);
    			append_dev(div2, t11);
    			mount_component(projectpreview3, div2, null);
    			append_dev(div2, t12);
    			mount_component(projectpreview4, div2, null);
    			append_dev(div2, t13);
    			mount_component(projectpreview5, div2, null);
    			append_dev(div2, t14);
    			mount_component(projectpreview6, div2, null);
    			append_dev(div2, t15);
    			mount_component(projectpreview7, div2, null);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const projectpreview0_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview0_spread_levels, [get_spread_object(projects.skillup)])
    			: {};

    			projectpreview0.$set(projectpreview0_changes);

    			const projectpreview1_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview1_spread_levels, [get_spread_object(projects.vgui)])
    			: {};

    			projectpreview1.$set(projectpreview1_changes);

    			const projectpreview2_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview2_spread_levels, [get_spread_object(projects.slocraft)])
    			: {};

    			projectpreview2.$set(projectpreview2_changes);

    			const projectpreview3_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview3_spread_levels, [get_spread_object(projects.glasbena)])
    			: {};

    			projectpreview3.$set(projectpreview3_changes);

    			const projectpreview4_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview4_spread_levels, [get_spread_object(projects.evpis)])
    			: {};

    			projectpreview4.$set(projectpreview4_changes);

    			const projectpreview5_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview5_spread_levels, [get_spread_object(projects.bunker)])
    			: {};

    			projectpreview5.$set(projectpreview5_changes);

    			const projectpreview6_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview6_spread_levels, [get_spread_object(projects.pud)])
    			: {};

    			projectpreview6.$set(projectpreview6_changes);

    			const projectpreview7_changes = (dirty & /*projects*/ 0)
    			? get_spread_update(projectpreview7_spread_levels, [get_spread_object(projects.lanparty)])
    			: {};

    			projectpreview7.$set(projectpreview7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectpreview0.$$.fragment, local);
    			transition_in(projectpreview1.$$.fragment, local);
    			transition_in(projectpreview2.$$.fragment, local);
    			transition_in(projectpreview3.$$.fragment, local);
    			transition_in(projectpreview4.$$.fragment, local);
    			transition_in(projectpreview5.$$.fragment, local);
    			transition_in(projectpreview6.$$.fragment, local);
    			transition_in(projectpreview7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectpreview0.$$.fragment, local);
    			transition_out(projectpreview1.$$.fragment, local);
    			transition_out(projectpreview2.$$.fragment, local);
    			transition_out(projectpreview3.$$.fragment, local);
    			transition_out(projectpreview4.$$.fragment, local);
    			transition_out(projectpreview5.$$.fragment, local);
    			transition_out(projectpreview6.$$.fragment, local);
    			transition_out(projectpreview7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section1);
    			destroy_component(projectpreview0);
    			destroy_component(projectpreview1);
    			destroy_component(projectpreview2);
    			destroy_component(projectpreview3);
    			destroy_component(projectpreview4);
    			destroy_component(projectpreview5);
    			destroy_component(projectpreview6);
    			destroy_component(projectpreview7);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $currentProjectView;
    	validate_store(currentProjectView, "currentProjectView");
    	component_subscribe($$self, currentProjectView, $$value => $$invalidate(0, $currentProjectView = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ProjectPreview,
    		projects,
    		currentProjectView,
    		$currentProjectView
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentProjectView*/ 1) {
    			document.body.classList.toggle("noscroll", $currentProjectView != "");
    		}
    	};

    	return [$currentProjectView];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
