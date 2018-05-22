(function() {
  var palette, state_buffer_max_length;

  palette = ["b58900", "cb4b16", "dc322f", "d33682", "6c71c4", "268bd2", "2aa198", "859900"];

  state_buffer_max_length = 20;

}).call(this);

(function() {
  window.PainlessUtils = class PainlessUtils {
    constructor() {
      this.a = 0;
    }

    generate_style() {
      /** EDGES */
      return new cytoscape.stylesheet().selector('edge').style({
        'curve-style': 'bezier',
        'width': 3,
        'source-endpoint': 'outside-to-node',
        'target-endpoint': 'outside-to-node',
        'arrow-scale': 1.5,
        'line-color': '#839496',
        'font-family': "Roboto",
        'font-size': '10',
        'text-outline-color': '#fdf6e3',
        'text-outline-width': '2px',
        'color': '#002b36'
      }).selector('.source-edge').style({
        'target-arrow-shape': 'square',
        'target-arrow-fill': 'hollow',
        'target-arrow-color': '#002b36'
      }).selector('.target-edge').style({
        'target-arrow-shape': 'square',
        'target-arrow-color': '#002b36'
      }).selector('.edge-datatype').style({
        'line-style': 'dotted'
      }).selector('.edge-concept').style({
        'content': 'rdf:type'
      /** NODES */
      }).selector('node').style({
        'background-color': 'black',
        'shape': 'rectangle'
      }).selector('.node-domain').style({
        'background-color': '#002b36',
        'border-color': '#002b36',
        'border-style': 'solid',
        'border-width': '0.5px',
        'width': 15,
        'height': 15
      }).selector('.node-range').style({
        'background-color': '#fdf6e3',
        'border-color': '#002b36',
        'border-style': 'solid',
        'border-width': '2px',
        'width': 15,
        'height': 15
      }).selector('.node-datatype').style({
        'shape': 'ellipse',
        'background-color': '#93a1a1',
        'content': 'data(label)',
        'text-valign': 'center',
        'font-family': "Roboto",
        'font-size': '12',
        'width': 15,
        'height': 15
      }).selector('.node-role').style({
        'shape': 'diamond',
        'background-color': '#fdf6e3',
        'border-style': 'solid',
        'border-color': '#002b36',
        'color': '#002b36',
        'border-width': '4px',
        'content': 'data(label)',
        'text-valign': 'center',
        'font-family': "Roboto",
        'text-outline-color': '#fdf6e3',
        'text-outline-width': '3px',
        'width': 90,
        'height': 60
      }).selector('.node-attribute').style({
        'shape': 'ellipse',
        'background-color': '#fdf6e3',
        'border-style': 'solid',
        'border-color': '#002b36',
        'color': '#002b36',
        'border-width': '4px',
        'content': 'data(label)',
        'text-valign': 'center',
        'font-family': "Roboto",
        'text-outline-color': '#fdf6e3',
        'text-outline-width': '3px',
        'width': 30,
        'height': 30
      }).selector('.node-variable').style({
        'shape': 'ellipse',
        'background-color': function(ele) {
          return ele.data('color');
        },
        'width': function(ele) {
          return 100;
        },
        'height': function(ele) {
          return 100;
        },
        'text-valign': 'center',
        'font-size': '30',
        'font-family': "Roboto",
        'color': '#fdf6e3',
        'text-outline-color': function(ele) {
          return ele.data('color');
        },
        'text-outline-width': '5px',
        'content': 'data(label)'
      }).selector('.node-constant-value').style({
        'shape': 'ellipse',
        'background-color': function(ele) {
          return ele.data('color');
        },
        'width': function(ele) {
          return 100;
        },
        'height': function(ele) {
          return 100;
        },
        'text-valign': 'center',
        'font-size': '20',
        'font-family': "Roboto",
        'color': '#fdf6e3',
        'text-outline-color': '#fdf6e3',
        'text-outline-width': '0px',
        'content': 'data(label)'
      }).selector('.node-constant-object').style({
        'shape': 'ellipse',
        'background-color': function(ele) {
          return ele.data('color');
        },
        'width': function(ele) {
          return 100;
        },
        'height': function(ele) {
          return 100;
        },
        'text-valign': 'center',
        'font-size': '20',
        'font-family': "Roboto",
        'color': '#fdf6e3',
        'text-outline-color': '#fdf6e3',
        'text-outline-width': '0px',
        'content': 'data(label)'
      }).selector('.node-concept').style({
        'shape': 'rectangle',
        'background-color': '#073642',
        'content': 'data(label)',
        'text-valign': 'center',
        'width': function(ele) {
          return ele.data('label').length * 10 + 50; //compute text length?
        },
        'height': '80',
        'border-color': '#073642',
        'border-width': '2px',
        'font-family': "Roboto",
        'font-size': '20',
        'color': '#fdf6e3',
        'border-style': 'solid'
      }).selector('node.highlight').style({
        'border-color': '#333',
        'border-opacity': '0.5',
        'border-width': '20px',
        'border-style': 'solid'
      }).selector('node:selected').style({
        'border-color': '#daa',
        'border-opacity': '0.5',
        'border-width': '20px',
        'border-style': 'solid'
      });
    }

  };

}).call(this);

(function() {
  window.HlBox = class HlBox {
    constructor(node) {
      this.to_html = this.to_html.bind(this);
      this.node = node;
    }

    to_html() {
      var res;
      res = document.createElement('div');
      res.innerHTML = '?' + this.node.id();
      res.className = 'highlighting_box';
      res.style.backgroundColor = this.node.data('color');
      return res;
    }

  };

}).call(this);

(function() {
  window.PainlessContextMenu = class PainlessContextMenu {
    constructor(cy, context) {
      this.init = this.init.bind(this);
      this.rename_const = this.rename_const.bind(this);
      this.rename_var = this.rename_var.bind(this);
      this.context = context;
      this.cy = cy;
      this.init();
    }

    init() {
      var node_attr_range_menu, node_concept_menu, node_constant_object_menu, node_constant_value_menu, node_link_attr_context_menu, node_link_context_menu, node_variable_context_menu;
      node_variable_context_menu = {
        selector: '.node-variable-full-options',
        commands: [
          {
            content: 'delete node',
            select: (ele) => {
              var i,
          j,
          len,
          len1,
          link,
          ref,
          to_remove;
              to_remove = [];
              ref = ele.data('links');
              for (i = 0, len = ref.length; i < len; i++) {
                link = ref[i];
                if (link !== null && link !== void 0) {
                  to_remove.push(link);
                }
              }
              for (j = 0, len1 = to_remove.length; j < len1; j++) {
                link = to_remove[j];
                link.delete();
              }
              return this.cy.remove(ele);
            }
          },
          {
            content: 'center view',
            select: (ele) => {
              return this.context.center_view(ele);
            }
          },
          {
            content: 'add node to select statement',
            select: (ele) => {
              return this.context.add_to_select(ele.id());
            }
          },
          {
            content: 'rename node',
            select: (ele) => {
              return this.rename_var(ele);
            }
          },
          {
            content: 'filter',
            select: (ele) => {
              return this.context.sparql_text.add_filter(ele);
            }
          }
        ]
      };
      node_link_context_menu = {
        selector: '.node-role',
        commands: [
          {
            content: 'reverse',
            select: (ele) => {
              console.log(ele.data('links'));
              return ele.data('links')[0].reverse();
            }
          },
          {
            content: 'delete',
            select: (ele) => {
              return ele.data('links')[0].delete();
            }
          }
        ]
      };
      node_link_attr_context_menu = {
        selector: '.node-attribute',
        commands: [
          {
            content: 'delete',
            select: (ele) => {
              return ele.data('links')[0].delete();
            }
          }
        ]
      };
      node_attr_range_menu = {
        selector: '.attr-range',
        commands: [
          {
            content: 'delete',
            select: (ele) => {
              return ele.data('links')[0].delete();
            }
          },
          {
            content: 'transform into constant [object]',
            select: (ele) => {
              ele.data('color',
          tinycolor(ele.data('color')).desaturate(50).toString());
              ele.data('label',
          'const[o]');
              return ele.classes('node-constant-object');
            }
          },
          {
            content: 'transform into constant [value]',
            select: (ele) => {
              ele.data('color',
          tinycolor(ele.data('color')).desaturate(50).toString());
              ele.data('label',
          'const[v]');
              return ele.classes('node-constant-value');
            }
          }
        ]
      };
      node_concept_menu = {
        selector: '.node-concept',
        commands: [
          {
            content: 'delete',
            select: (ele) => {
              return ele.data('links')[0].delete();
            }
          }
        ]
      };
      node_constant_value_menu = {
        selector: '.node-constant-value',
        commands: [
          {
            content: 'define value',
            select: (ele) => {
              return this.rename_const(ele);
            }
          },
          {
            content: 'delete',
            select: (ele) => {
              return ele.data('links')[0].delete();
            }
          }
        ]
      };
      node_constant_object_menu = {
        selector: '.node-constant-object',
        commands: [
          {
            content: 'define value',
            select: (ele) => {
              return this.rename_const(ele);
            }
          },
          {
            content: 'delete',
            select: (ele) => {
              return ele.data('links')[0].delete();
            }
          }
        ]
      };
      this.cy.cxtmenu(node_variable_context_menu);
      this.cy.cxtmenu(node_link_context_menu);
      this.cy.cxtmenu(node_link_attr_context_menu);
      this.cy.cxtmenu(node_concept_menu);
      this.cy.cxtmenu(node_constant_value_menu);
      return this.cy.cxtmenu(node_attr_range_menu);
    }

    rename_const(ele) {
      var container, div, keypresshandler, outclickhandler, prevlabel;
      prevlabel = ele.data('label');
      ele.data('label', '');
      container = document.createElement(div);
      div = document.createElement('div');
      div.innerHTML = ele.data('label').slice(1);
      div.style.display = 'inline-block';
      outclickhandler = (event) => {
        if (event.target !== div) {
          if (div.innerHTML === '') {
            div.innerHTML = prevlabel;
          }
          ele.data('label', div.innerHTML);
          container.parentNode.removeChild(container);
          document.removeEventListener('click', outclickhandler);
          return document.removeEventListener('keypress', keypresshandler);
        }
      };
      keypresshandler = (event) => {
        if (event.key === 'Enter') {
          if (div.innerHTML === '') {
            div.innerHTML = prevlabel;
          }
          ele.data('label', div.innerHTML);
          container.parentNode.removeChild(container);
          document.removeEventListener('click', outclickhandler);
          return document.removeEventListener('keypress', keypresshandler);
        }
      };
      document.addEventListener('click', outclickhandler);
      document.addEventListener('keypress', keypresshandler);
      div.setAttribute('contenteditable', true);
      container.appendChild(div);
      container.style.position = "absolute";
      container.id = "rename_div";
      container.style.top = document.getElementById('query_canvas').getBoundingClientRect()['y'] + ele.renderedPosition('y') - ele.renderedWidth() / 4 + 'px';
      container.style.left = document.getElementById('query_canvas').getBoundingClientRect()['x'] + ele.renderedPosition('x') - ele.renderedWidth() / 4 + 'px';
      container.style.backgroundColor = ele.data('color');
      container.style.fontSize = 'xx-large';
      container.style.color = '#fdf6e3';
      container.style.borderRadius = '100px';
      container.style.fontFamily = 'Courier New';
      container.style.padding = '2px';
      container.style.textAlign = 'center';
      document.body.appendChild(container);
      return div.focus();
    }

    rename_var(ele) {
      var container, div, keypresshandler, outclickhandler, prevlabel, question_mark;
      prevlabel = ele.data('label').slice(1);
      ele.data('label', '');
      container = document.createElement(div);
      question_mark = document.createElement('div');
      question_mark.innerHTML = '?';
      question_mark.style.display = 'inline-block';
      container.appendChild(question_mark);
      div = document.createElement('div');
      div.innerHTML = ele.data('label').slice(1);
      div.style.display = 'inline-block';
      outclickhandler = (event) => {
        if (event.target !== div) {
          if (div.innerHTML === '') {
            div.innerHTML = prevlabel;
          }
          ele.data('label', '?' + div.innerHTML);
          container.parentNode.removeChild(container);
          document.removeEventListener('click', outclickhandler);
          return document.removeEventListener('keypress', keypresshandler);
        }
      };
      keypresshandler = (event) => {
        if (event.key === 'Enter') {
          if (div.innerHTML === '') {
            div.innerHTML = prevlabel;
          }
          ele.data('label', '?' + div.innerHTML);
          container.parentNode.removeChild(container);
          document.removeEventListener('click', outclickhandler);
          return document.removeEventListener('keypress', keypresshandler);
        }
      };
      document.addEventListener('click', outclickhandler);
      document.addEventListener('keypress', keypresshandler);
      div.setAttribute('contenteditable', true);
      container.appendChild(div);
      container.style.position = "absolute";
      container.id = "rename_div";
      container.style.top = document.getElementById('query_canvas').getBoundingClientRect()['y'] + ele.renderedPosition('y') - ele.renderedWidth() / 4 + 'px';
      container.style.left = document.getElementById('query_canvas').getBoundingClientRect()['x'] + ele.renderedPosition('x') - ele.renderedWidth() / 4 + 'px';
      container.style.backgroundColor = ele.data('color');
      container.style.fontSize = 'xx-large';
      container.style.color = '#fdf6e3';
      container.style.borderRadius = '100px';
      container.style.fontFamily = 'Courier New';
      container.style.padding = '2px';
      container.style.textAlign = 'center';
      document.body.appendChild(container);
      return div.focus();
    }

  };

}).call(this);

(function() {
  //_require cyto_style.coffee
  //_require sparql_text.coffee
  //_require painless_link.coffee 
  window.PainlessGraph = (function() {
    /** manages the graph visualization
        TODO: hardcoded collision distance should be in constants
    */
    var links, state_buffer;

    class PainlessGraph {
      constructor(context) {
        this.reshape = this.reshape.bind(this);
        this.download = this.download.bind(this);
        this.clear_all = this.clear_all.bind(this);
        this.center_view = this.center_view.bind(this);
        this.add_to_select = this.add_to_select.bind(this);
        this.reverse_relationship = this.reverse_relationship.bind(this);
        this.add_link = this.add_link.bind(this);
        this.check_collisions = this.check_collisions.bind(this);
        this.init = this.init.bind(this);
        /**
        TODO: sparql_text should be managed by painless_sparql.coffee
        */
        this.utils = new window.PainlessUtils();
        this.context = context;
        this.links = links;
        this.layout_names = ['cola', 'cose-bilkent', 'circle', 'cose', 'grid', 'breadthfirst', 'concentric'];
        this.layout_index = 0;
        this.init();
        this.reshape();
        this.sparql_text = new SparqlText(this.cy, links);
        this.sparql_text.update();
        new window.PainlessContextMenu(this.cy, this);
      }

      reshape() {
        /** resets node positions in the graph view */
        this.layout = this.layout_names[this.layout_index % this.layout_names.length];
        return this.cy.layout({
          name: this.layout,
          fit: false,
          animate: true,
          nodeDimensionsIncludeLabels: true,
          //padding: 
          edgeLength: 200
        }).run();
      }

      download() {
        var a, data, file, filename, type, url;
        data = JSON.stringify(this.cy.json());
        filename = "sparql.json";
        type = "text/plain";
        file = new Blob([data], {
          type: type
        });
        if (window.navigator.msSaveOrOpenBlob) {
          return window.navigator.msSaveOrOpenBlob(file, filename);
        } else {
          a = document.createElement("a");
          url = URL.createObjectURL(file);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          return setTimeout(() => {
            document.body.removeChild(a);
            return window.URL.revokeObjectURL(url);
          }, 0);
        }
      }

      clear_all() {
        var i, len, link, ref;
        ref = this.links;
        for (i = 0, len = ref.length; i < len; i++) {
          link = ref[i];
          link.delete();
        }
        return this.sparql_text.update();
      }

      center_view(ele = null) {
        /** 
        TODO: pan and center should actually be two different buttons!
        */
        if (ele === null) {
          if (this.cy.nodes(':selected').length > 0) {
            return this.cy.center(this.cy.nodes(':selected'));
          } else {
            return this.cy.fit();
          }
        } else {
          return this.cy.center(ele);
        }
      }

      add_to_select(node_id) {
        return this.sparql_text.add_to_select(node_id);
      }

      copy_to_clipboard() {
        return this.sparql_text.copy_to_clipboard();
      }

      save_state() {
        if (state_buffer === null) {
          state_buffer = [];
        }
        if (this.cy.json() !== state_buffer[state_buffer.length - 1]) {
          state_buffer.push(this.cy.json());
        }
        if (state_buffer.length >= state_buffer_max_length) {
          return state_buffer.shift();
        }
      }

      undo() {
        if (state_buffer === null || state_buffer.length < 1) {
          return console.warn("no saved states");
        } else {
          this.cy.json(state_buffer[state_buffer.length - 1]);
          this.cy.style(this.utils.generate_style());
          state_buffer.pop();
          return this.reshape();
        }
      }

      reverse_relationship() {
        var s_node;
        s_node = this.cy.nodes(":selected");
        if (s_node === null) {
          return console.warn('please select a node in the sparql graph');
        } else if (s_node.hasClass("node-variable")) {
          return console.warn('please select a role and not a variable');
        } else if (s_node.data('links').link_type === 'attribute') {
          return console.warn('attributes cannot be reversed');
        } else if (s_node.hasClass("node-role") || s_node.hasClass("node-domain") || s_node.hasClass("node-range")) {
          return this.cy.nodes(":selected").data('links').reverse();
        } else {
          return console.warn('this action cannot be performed on the selected node');
        }
      }

      merge(node1, node2) {
        var i, len, link, node_var1, node_var2, ref;
        /** merges node1 and node2, repositioning all node2's edges into node1 */
        this.save_state();
        ref = node2.data('links');
        for (i = 0, len = ref.length; i < len; i++) {
          link = ref[i];
          if (link.link_type === 'concept') {
            links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = node1));
          } else {
            if (link.node_var1 === node2 && link.node_var2 === node2) {
              links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = node1, node_var2 = node1));
            } else if (link.node_var1 === node2) {
              links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = node1, node_var2 = link.node_var2));
            } else {
              links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = link.node_var1, node_var2 = node1));
            }
          }
          link.delete();
        }
        return this.cy.remove(node2);
      }

      add_link(link_name, link_type, datatype) {
        /** if a var node is selected, the link is added to the var node and one new var node is created*/
        var link;
        /** adds a new link in the graph. 
            links that are not concepts (roles and attributes) add a new variable into the graph.
            links are always added to the selected variable in the graph, if there are no selected variables,   
                two new variables are created.

            links can be:
            - concepts   
            - roles
            - attributes

            TODO: use an enum to represent link types instead of hardcoded strings
        */
        this.save_state();
        if (link_type === 'concept') {
          if (this.cy.nodes(":selected").length > 0 && this.cy.nodes(":selected").hasClass('node-variable')) {
            link = new PainlessLink(this, this.cy, link_name, link_type, this.cy.nodes(":selected"));
          } else {
            link = new PainlessLink(this, this.cy, link_name, link_type);
            this.sparql_text.add_to_select(link.node_var1.id());
          }
        } else {
          if (this.cy.nodes(":selected").length > 0 && this.cy.nodes(":selected").hasClass('node-variable')) {
            link = new PainlessLink(this, this.cy, link_name, link_type, this.cy.nodes(":selected"), null, datatype);
            this.sparql_text.add_to_select(link.node_var2.id());
          } else {
            /** otherwise, two new var nodes are created */
            link = new PainlessLink(this, this.cy, link_name, link_type, null, null, datatype);
            this.sparql_text.add_to_select(link.node_var1.id());
            this.sparql_text.add_to_select(link.node_var2.id());
          }
        }
        links.push(link);
        this.sparql_text.update();
        return this.reshape();
      }

      compute_distance(node1, node2) {
        /** computes distance between two node positions */
        var a, b;
        a = Math.abs(node1.position('x') - node2.position('x'));
        b = Math.abs(node1.position('y') - node2.position('y'));
        return Math.sqrt(a * a + b * b);
      }

      check_collisions() {
        var i, j, len, len1, node, node2, ref, ref1;
        ref = this.cy.nodes(".node-variable");
        /** check if there are any collisions in all the node variables
        returns the colliding nodes if there are any.

        TODO: collision highlight is broken!
        TODO: remove hardcoded collision distance threshold
        */
        for (i = 0, len = ref.length; i < len; i++) {
          node = ref[i];
          ref1 = this.cy.nodes(".node-variable");
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            node2 = ref1[j];
            if (node !== node2) {
              if (this.compute_distance(node, node2) < 100) {
                node.addClass('highlight');
                node2.addClass('highlight');
                return [node, node2];
              } else {
                node.removeClass('highlight');
              }
            }
          }
        }
      }

      init() {
        this.cy = new cytoscape({
          container: document.getElementById("query_canvas"),
          style: this.utils.generate_style(),
          wheelSensitivity: 0.5
        });
        this.cy.on('click', '.node-variable', (event) => {
          event.target.select();
          return this.reshape();
        });
        this.cy.on('mouseup', ($) => {
          var node_tmp_arr;
          if (this.check_collisions() !== void 0) {
            node_tmp_arr = this.check_collisions();
            this.merge(node_tmp_arr[0], node_tmp_arr[1]);
          }
          return this.reshape();
        });
        return this.cy.resize();
      }

    };

    state_buffer = null;

    links = [];

    return PainlessGraph;

  }).call(this);

}).call(this);

(function() {
  //_require constants.coffee
  window.PainlessLink = (function() {
    var color_index;

    class PainlessLink {
      constructor(context, cy, link_name, link_type, node_var1 = null, node_var2 = null, datatype) {
        this.create_edge = this.create_edge.bind(this);
        this.reverse = this.reverse.bind(this);
        this.add_datatype = this.add_datatype.bind(this);
        this.create_node = this.create_node.bind(this);
        this.delete = this.delete.bind(this);
        this.create_link = this.create_link.bind(this);
        this.create_concept = this.create_concept.bind(this);
        this.cy = cy;
        this.context = context;
        console.log(this.context);
        this.link_name = link_name;
        this.link_type = link_type;
        this.node_var1 = node_var1;
        this.node_var2 = node_var2;
        this.edge_source = null;
        this.edge_target = null;
        this.datatype = datatype;
        this.datatype_node = null;
        if (link_type === 'concept') {
          this.create_concept();
        } else {
          this.create_link();
        }
      }

      find_new_name(base_name = null) {
        var i;
        if (base_name === null) {
          base_name = "x";
        }
        i = 0;
        while (this.cy.getElementById(base_name + i).length !== 0) {
          i += 1;
        }
        return base_name + i;
      }

      create_edge(node1, node2, classes = null) {
        return this.cy.add({
          group: 'edges',
          data: {
            source: node1.id(),
            target: node2.id()
          },
          classes: classes
        });
      }

      reverse() {
        /** can only be applied to non-concept relationships */
        if (this.source === this.node_var1) {
          this.edge_source.classes('target-edge');
          this.edge_target.classes('source-edge');
          this.source = this.node_var2;
          return this.target = this.node_var1;
        } else {
          this.edge_source.classes('source-edge');
          this.edge_target.classes('target-edge');
          this.source = this.node_var1;
          return this.target = this.node_var2;
        }
      }

      add_datatype(node, datatype) {
        this.datatype_node = this.cy.add({
          group: 'nodes',
          data: {
            label: datatype
          },
          classes: 'node-datatype'
        });
        return this.edge_datatype = this.cy.add({
          group: 'edges',
          data: {
            source: node.id(),
            target: this.datatype_node.id(),
            weight: 99
          },
          classes: 'edge-datatype'
        });
      }

      create_node(type, label = null) {
        var data;
        data = {};
        if (type === 'node-variable') {
          label = this.find_new_name(label);
          data['id'] = label;
          data['color'] = '#' + palette[color_index % palette.length];
          color_index += 1;
        }
        if (type === 'node-concept') {
          data['label'] = this.link_name;
        } else if (type === 'node-attribute' || type === 'node-role') {
          data['label'] = label;
        } else {
          data['label'] = '?' + label;
        }
        data['links'] = [this];
        return this.cy.add({
          group: 'nodes',
          data: data,
          classes: type
        });
      }

      delete() {
        var i, index, j, k, len, node_var, ref, ref1;
        index = this.context.links.indexOf(this);
        this.context.links.splice(index, 1);
        this.context.sparql_text.update();
        if (this.node_link !== null && this.node_link !== void 0) {
          this.cy.remove(this.node_link);
        }
        if (this.node_concept !== null && this.node_concept !== void 0) {
          this.cy.remove(this.node_concept);
        }
        if (this.datatype_node !== null && this.datatype_node !== void 0) {
          this.cy.remove(this.datatype_node);
        }
        ref = [this.node_var1, this.node_var2];
        for (j = 0, len = ref.length; j < len; j++) {
          node_var = ref[j];
          if (node_var !== null && node_var !== void 0) {
            index = node_var.data('links').indexOf(this);
            node_var.data('links').splice(index, 1);
            if (node_var.data('links').length === 0) {
              console.log(this.context.sparql_text.select_boxes);
              for (i = k = 0, ref1 = this.context.sparql_text.select_boxes.length; (0 <= ref1 ? k < ref1 : k > ref1); i = 0 <= ref1 ? ++k : --k) {
                if (this.context.sparql_text.select_boxes[i] === node_var.id()) {
                  this.context.sparql_text.select_boxes.splice(i, 1);
                }
              }
              this.cy.remove(node_var);
            }
          }
        }
        return this.context.sparql_text.update();
      }

      create_link() {
        if (this.node_var1 === null || this.node_var1 === void 0) {
          this.node_var1 = this.create_node('node-variable');
          this.node_var1.classes('node-variable node-variable-full-options');
        } else if (this.node_var1.hasClass('attr-range')) {
          console.warn('properties can\'t be added to the range of an attribute');
          return;
        } else {
          this.node_var1.data('links').push(this);
        }
        if (this.node_var2 === null || this.node_var2 === void 0) {
          if (this.link_type === 'attribute') {
            this.node_var2 = this.create_node('node-variable', this.link_name);
            this.node_var2.classes('node-variable attr-range');
            if (this.datatype !== null && this.datatype !== void 0) {
              this.add_datatype(this.node_var2, this.datatype);
            }
          } else {
            this.node_var2 = this.create_node('node-variable');
            this.node_var2.classes('node-variable node-variable-full-options');
          }
        } else {
          this.node_var2.data('links').push(this);
        }
        this.source = this.node_var1;
        this.target = this.node_var2;
        if (this.link_type === 'role') {
          this.node_link = this.create_node('node-role', this.link_name);
        } else {
          this.node_link = this.create_node('node-attribute', this.link_name);
        }
        this.edge_source = this.create_edge(this.node_link, this.source, "source-edge");
        return this.edge_target = this.create_edge(this.node_link, this.target, "target-edge");
      }

      create_concept() {
        if (this.node_var1 === null || this.node_var1 === void 0) {
          this.node_var1 = this.create_node('node-variable');
          this.node_var1.classes('node-variable node-variable-full-options');
        }
        this.node_var1.data('links').push(this);
        this.node_concept = this.create_node('node-concept');
        return this.create_edge(this.node_var1, this.node_concept, 'edge-concept');
      }

    };

    color_index = 0;

    return PainlessLink;

  }).call(this);

}).call(this);

(function() {
  window.PainlessMenu = class PainlessMenu {
    constructor(context) {
      this.change_size = this.change_size.bind(this);
      this.create_navigation_div = this.create_navigation_div.bind(this);
      this.init = this.init.bind(this);
      this.context = context;
      this.init();
    }

    change_size(query_canvas_size) {
      this.context.query_canvas.style.height = query_canvas_size + "%";
      sparql_textbox.style.height = (100 - 10 - query_canvas_size) + "%";
      return setTimeout(() => {
        return this.context.graph.cy.resize();
      }, 550);
    }

    create_div(innerHTML = null, className = null, id = null, onclick = null) {
      var div;
      div = document.createElement('div');
      div.innerHTML = innerHTML;
      div.className = className;
      div.id = id;
      div.onclick = onclick;
      return div;
    }

    create_navigation_div() {
      var nav_div;
      nav_div = this.create_div(null, null, 'nav_div');
      nav_div.append(this.create_div('▲', 'resize_button', null, () => {
        return this.change_size(90);
      }));
      nav_div.append(this.create_div('≡', 'resize_button', null, () => {
        return this.change_size(60);
      }));
      nav_div.append(this.create_div('▼', 'resize_button', null, () => {
        return this.change_size(0);
      }));
      return nav_div;
    }

    init() {
      var menu;
      menu = this.create_div(null, null, 'painless_menu');
      document.getElementById('sidenav').append(menu);
      menu.append(this.create_navigation_div());
      menu.append(this.create_div('<i class="material-icons">undo</i>', 'menu_button', null, () => {
        return this.context.graph.undo();
      }));
      menu.append(this.create_div('<i class="material-icons">filter_center_focus</i>', 'menu_button', null, () => {
        return this.context.graph.center_view();
      }));
      menu.append(this.create_div('<i class="material-icons">file_copy</i>', 'menu_button', null, () => {
        return this.context.graph.copy_to_clipboard();
      }));
      menu.append(this.create_div('<i class="material-icons">save</i>', 'menu_button', null, () => {
        return this.context.graph.download();
      }));
      return menu.append(this.create_div('<i class="material-icons">clear_all</i>', 'menu_button', null, () => {
        return this.context.graph.clear_all();
      }));
    }

  };

}).call(this);

(function() {
  window.PainlessSparql = (function() {
    var cur_sidenav_size, tappedBefore, tappedTimeout;

    class PainlessSparql {
      constructor(graph) {
        this.add_to_query = this.add_to_query.bind(this);
        this.extract_datatype = this.extract_datatype.bind(this);
        this.create_sidenav = this.create_sidenav.bind(this);
        this.onkeypress_handler = this.onkeypress_handler.bind(this);
        this.cy = graph.cy;
        this.init();
      }

      init() {
        this.create_sidenav();
        this.sparql_text = this.graph.sparql_text;
        this.menu = new window.PainlessMenu(this);
        return this.add_event_listener();
      }

      add_to_query() {
        var selected_node;
        selected_node = this.cy.nodes(":selected");
        if (selected_node.length === 0) {
          console.warn("please, select a node in the main graph");
        }
        switch (selected_node.data('type')) {
          case "role":
            return this.graph.add_link(selected_node.data('label'), 'role');
          case "attribute":
            return this.graph.add_link(selected_node.data('label'), 'attribute', this.extract_datatype(selected_node));
          case "concept":
            return this.graph.add_link(selected_node.data('label'), 'concept');
        }
      }

      extract_datatype(inode) {
        var i, j, len, len1, neighbor, node, ref, ref1;
        ref = inode.neighborhood('node');
        for (i = 0, len = ref.length; i < len; i++) {
          neighbor = ref[i];
          if (neighbor.data('type') === "range-restriction") {
            ref1 = neighbor.neighborhood('node');
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              node = ref1[j];
              if (node.data('type') === "value-domain") {
                return node.data('label');
              }
            }
          }
        }
      }

      create_sidenav() {
        var button, parsedQuery, parser, side_nav, side_nav_container, slider, slider_button, sparql_textbox;
        parser = new SparqlParser();
        parsedQuery = parser.parse('PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' + 'SELECT * { ?mickey foaf:name "Mickey Mouse"@en; foaf:knows ?other. }');
        console.log(parsedQuery);
        side_nav_container = document.createElement("div");
        side_nav_container.id = "sidenav_container";
        side_nav_container.style.width = (cur_sidenav_size * document.documentElement.clientWidth / 100 + 40) + "px";
        document.body.appendChild(side_nav_container);
        document.getElementById('tools').style.right = (cur_sidenav_size * document.documentElement.clientWidth / 100 + 50) + "px";
        document.getElementById('tools').style.transitionDuration = '0.1s';
        document.getElementById('cy').style.width = ((100 - cur_sidenav_size) * document.documentElement.clientWidth / 100 + 50) + "px";
        this.cy.resize();
        slider = document.createElement("div");
        slider.style.backgroundColor = '#93a1a1';
        slider.style.height = '100%';
        slider.id = 'slider';
        slider.style.width = '100%';
        slider.style.display = 'inline-block';
        sidenav_container.appendChild(slider);
        slider_button = document.createElement('div');
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_left</i>';
        slider_button.className = 'slider_button';
        slider_button.onclick = () => {
          cur_sidenav_size = cur_sidenav_size + 25;
          document.getElementById('tools').style.right = (cur_sidenav_size * document.documentElement.clientWidth / 100 + 50) + "px";
          document.getElementById('tools').style.transitionDuration = '0.1s';
          document.getElementById('cy').style.width = ((100 - cur_sidenav_size) * document.documentElement.clientWidth / 100 + 50) + "px";
          this.cy.resize();
          if (cur_sidenav_size !== 100) {
            side_nav_container.style.width = (cur_sidenav_size * document.documentElement.clientWidth / 100 + 30) + "px";
            side_nav.style.width = cur_sidenav_size + '%';
          } else {
            side_nav_container.style.width = (cur_sidenav_size * document.documentElement.clientWidth / 100) + "px";
            side_nav.style.width = (cur_sidenav_size * document.documentElement.clientWidth / 100 - 30) + "px";
          }
          return setTimeout(() => {
            return this.graph.cy.resize();
          }, 550);
        };
        slider.appendChild(slider_button);
        slider_button = document.createElement('div');
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_right</i>';
        slider_button.className = 'slider_button';
        slider_button.onclick = () => {
          cur_sidenav_size = cur_sidenav_size - 25;
          document.getElementById('tools').style.right = (cur_sidenav_size * document.documentElement.clientWidth / 100 + 50) + "px";
          document.getElementById('tools').style.transitionDuration = '0.1s';
          document.getElementById('cy').style.width = ((100 - cur_sidenav_size) * document.documentElement.clientWidth / 100 + 50) + "px";
          this.cy.resize();
          side_nav_container.style.width = (cur_sidenav_size * document.documentElement.clientWidth / 100 + 30) + "px";
          side_nav.style.width = cur_sidenav_size + '%';
          return setTimeout(() => {
            return this.graph.cy.resize();
          }, 550);
        };
        slider.appendChild(slider_button);
        button = document.createElement("div");
        button.innerHTML = '<i class="material-icons">add</i><p style="font-size:xx-small; margin-top: -5px">node</p>';
        button.className = "slider_button";
        button.style.bottom = 0;
        button.style.position = 'fixed';
        button.style.marginLeft = '5px';
        button.onclick = () => {
          return this.add_to_query();
        };
        slider.appendChild(button);
        side_nav = document.createElement("div");
        side_nav.id = "sidenav";
        side_nav.className = "sidenav";
        side_nav.style.display = 'inline-block';
        side_nav.style.width = cur_sidenav_size + '%';
        side_nav_container.appendChild(side_nav);
        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        side_nav.appendChild(sparql_textbox);
        this.query_canvas = document.createElement("div");
        this.query_canvas.id = "query_canvas";
        side_nav.appendChild(this.query_canvas);
        return this.graph = new PainlessGraph(this.query_canvas);
      }

      open_nav() {
        return document.getElementById("sidenav").style.width = "50%";
      }

      close_nav() {
        return document.getElementById("sidenav").style.width = "0px";
      }

      onkeypress_handler(event) {
        var i, len, link, ref, results;
        if (event.key === "a") {

        
        //@open_nav()
        } else if (event.key === "b") {

        //@close_nav()
        } else if (event.key === "d") {
          return console.log(this.graph.cy.nodes(":selected").data('links'));
        } else if (event.key === "l") {
          this.graph.layout_index += 1;
          this.graph.reshape();
          return console.log(this.graph.layout);
        } else if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 127) {
          ref = this.graph.cy.nodes(":selected").data('links');
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            link = ref[i];
            results.push(link.delete());
          }
          return results;
        }
      }

      add_event_listener() {
        document.onkeypress = this.onkeypress_handler;
        return this.cy.on('tap', (event) => {
          var originalTapEvent, tappedNow;
          tappedNow = event.target;
          if (tappedTimeout && tappedBefore) {
            clearTimeout(tappedTimeout);
          }
          if (tappedBefore === tappedNow) {
            tappedNow.trigger('doubleTap', event);
            tappedBefore = null;
            originalTapEvent = null;
            return this.add_to_query();
          } else {
            tappedTimeout = setTimeout(() => {
              return tappedBefore = null;
            }, 300);
            return tappedBefore = tappedNow;
          }
        });
      }

    };

    PainlessSparql.graph = null;

    cur_sidenav_size = 50;

    tappedBefore = null;

    tappedTimeout = null;

    return PainlessSparql;

  }).call(this);

}).call(this);

(function() {
  window.QueryFilter = class QueryFilter {
    constructor(node) {
      this.new_condition = this.new_condition.bind(this);
      this.to_html = this.to_html.bind(this);
      this.node = node;
      this.conditions = [];
      this.conditions.push(this.new_condition());
    }

    new_condition() {
      var d, hl_box, operator, v, value;
      d = document.createElement('div');
      if (this.node !== void 0) {
        hl_box = new window.HlBox(this.node);
        d.appendChild(hl_box.to_html());
      } else {
        v = new window.Void;
        d.appendChild(v.to_html());
      }
      operator = document.createElement('div');
      operator.innerHTML = ">=";
      operator.style.marginLeft = '5px';
      operator.style.marginRight = '5px';
      d.appendChild(operator);
      value = document.createElement('div');
      value.innerHTML = "100 ^^xsd:string";
      value.contentEditable = 'true';
      d.appendChild(value);
      return d;
    }

    to_html() {
      var condition, conditions_container, i, len, ref, remove_button, result_div, start;
      result_div = document.createElement('div');
      start = document.createElement('div');
      start.innerHTML = "filter ";
      start.style.display = "inline";
      result_div.append(start);
      conditions_container = document.createElement('div');
      conditions_container.className = "filter_condition_container";
      ref = this.conditions;
      for (i = 0, len = ref.length; i < len; i++) {
        condition = ref[i];
        conditions_container.appendChild(condition);
      }
      result_div.append(conditions_container);
      remove_button = document.createElement('div');
      remove_button.innerHTML = '❎';
      remove_button.style.color = '#F08080';
      remove_button.style.fontSize = 'large';
      remove_button.style.marginLeft = '8px';
      remove_button.style.visibility = 'hidden';
      remove_button.style.display = 'inline-block';
      remove_button.onclick = () => {
        return console.log('click');
      };
      result_div.append(remove_button);
      result_div.onmouseover = () => {
        return remove_button.style.visibility = 'visible';
      };
      result_div.onmouseout = () => {
        return remove_button.style.visibility = 'hidden';
      };
      return result_div;
    }

  };

}).call(this);

(function() {
  window.QueryLine = class QueryLine {
    constructor(link, sparql_text) {
      this.to_html = this.to_html.bind(this);
      this.create_highlighting_box = this.create_highlighting_box.bind(this);
      this.link = link;
      this.sparql_text = sparql_text;
    }

    to_html() {
      var button_div, f, link_div, q_line, remove_button, reverse_button;
      q_line = document.createElement('div');
      if (this.link.link_type === 'concept') {
        q_line.append(this.create_highlighting_box(this.link.node_var1));
        f = document.createElement("div");
        f.innerHTML = "rdf:type " + this.link.node_concept.data('label') + " .";
        q_line.append(f);
      } else {
        q_line.append(this.create_highlighting_box(this.link.source));
        link_div = document.createElement('div');
        link_div.innerHTML = this.link.node_link.data('label') + "&nbsp;";
        q_line.append(link_div);
        q_line.append(this.create_highlighting_box(this.link.target));
        f = document.createElement("div");
        f.innerHTML = " .";
        q_line.append(f);
      }
      button_div = document.createElement('div');
      button_div.style.visibility = 'hidden';
      if (this.link.link_type !== 'concept') {
        reverse_button = document.createElement('div');
        reverse_button.innerHTML = '🔄';
        reverse_button.style.color = '#ADD8E6';
        reverse_button.style.fontSize = 'large';
        reverse_button.style.marginLeft = '8px';
        reverse_button.style.display = 'inline-block';
        reverse_button.onclick = () => {
          this.link.reverse();
          return this.sparql_text.update();
        };
        button_div.append(reverse_button);
      }
      remove_button = document.createElement('div');
      remove_button.innerHTML = '❎';
      remove_button.style.color = '#F08080';
      remove_button.style.fontSize = 'large';
      remove_button.style.marginLeft = '8px';
      remove_button.style.display = 'inline-block';
      remove_button.onclick = () => {
        this.link.delete();
        return this.sparql_text.update();
      };
      button_div.append(remove_button);
      q_line.append(button_div);
      q_line.onmouseover = () => {
        return button_div.style.visibility = 'visible';
      };
      q_line.onmouseout = () => {
        return button_div.style.visibility = 'hidden';
      };
      q_line.className = 'q_line';
      return q_line;
    }

    create_highlighting_box(node) {
      /** creates a box in the sparql text that helps locate in the graph where the node is */
      var container, st;
      container = document.createElement('div');
      container.className = 'highlighting_box_container';
      st = document.createElement('div');
      st.className = "highlighting_box";
      st.id = node.id() + Math.round(Math.random() * 1000);
      st.dataset.prevname = node.id();
      st.dataset.node_id = node.id();
      st.ondblclick = () => {
        st.setAttribute('contenteditable', 'true');
        this.sparql_text.cy.center(node);
        setTimeout(() => {
          return st.focus();
        }, 0);
        return st.onkeydown = (event) => {
          node.data('label', st.innerHTML);
          if (event.keyCode === 13) {
            event.preventDefault();
            if (st.innerHTML.length <= 2) {
              st.innerHTML = node.id();
            }
            st.setAttribute('contenteditable', 'false');
            return this.sparql_text.update();
          }
        };
      };
      st.onmouseover = function($) {
        return node.addClass("highlight");
      };
      st.onmouseout = function($) {
        return node.removeClass("highlight");
      };
      st.onclick = ($) => {
        this.sparql_text.cy.nodes().unselect();
        return node.select();
      };
      st.innerHTML = node.data('label');
      st.style.backgroundColor = node.data('color');
      container.append(st);
      return container;
    }

  };

}).call(this);

(function() {
  //_require query_filter.coffee
  window.SparqlText = (function() {
    var cy, div_sparql_text, links, select_boxes;

    class SparqlText {
      constructor(cy, links) {
        this.create_highlighting_box = this.create_highlighting_box.bind(this);
        this.remove_from_select_boxes = this.remove_from_select_boxes.bind(this);
        this.generate_plaintext_query = this.generate_plaintext_query.bind(this);
        this.copy_to_clipboard = this.copy_to_clipboard.bind(this);
        this.add_filter = this.add_filter.bind(this);
        this.update = this.update.bind(this);
        div_sparql_text = document.getElementById('sparql_textbox');
        div_sparql_text.className = "unselectable";
        this.select_boxes = select_boxes;
        this.cy = cy;
        this.links = links;
        this.filters = [];
      }

      add_to_select(id) {
        select_boxes.push(id);
        return this.update();
      }

      create_tab() {
        var nbsp;
        nbsp = document.createElement('div');
        nbsp.innerHTML = '&nbsp;';
        return nbsp;
      }

      rename(st) {
        var i, j, node, ref;
        node = this.cy.getElementById(st.dataset.node_id);
        for (i = j = 0, ref = select_boxes.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          if (select_boxes[i] === st.dataset.prevname) {
            select_boxes[i] = st.innerHTML.substr(i);
          }
        }
        return node.data('label', st.innerHTML.substr(1));
      }

      create_highlighting_box(node) {
        /** creates a box in the sparql text that helps locate in the graph where the node is */
        var container, minicross, st;
        container = document.createElement('div');
        container.className = 'highlighting_box_container';
        st = document.createElement('div');
        st.className = "highlighting_box";
        st.id = node.id() + Math.round(Math.random() * 1000);
        st.dataset.prevname = node.id();
        st.dataset.node_id = node.id();
        st.ondblclick = () => {
          st.setAttribute('contenteditable', 'true');
          this.cy.center(node);
          setTimeout(() => {
            return st.focus();
          }, 0);
          return st.onkeydown = (event) => {
            node.data('label', st.innerHTML);
            if (event.keyCode === 13) {
              event.preventDefault();
              if (st.innerHTML.length <= 2) {
                st.innerHTML = node.id();
              }
              st.setAttribute('contenteditable', 'false');
              return this.update();
            }
          };
        };
        st.onmouseover = function($) {
          return node.addClass("highlight");
        };
        st.onmouseout = function($) {
          return node.removeClass("highlight");
        };
        st.onclick = ($) => {
          this.cy.nodes().unselect();
          return node.select();
        };
        st.innerHTML = node.data('label');
        st.style.backgroundColor = node.data('color');
        container.append(st);
        minicross = document.createElement('div');
        minicross.innerHTML = ' x ';
        minicross.className = 'minicross';
        minicross.dataset.linkedhbox = st.id;
        minicross.dataset.node_id = st.dataset.node_id;
        minicross.style.visibility = 'hidden';
        minicross.onclick = ($) => {
          return this.remove_from_select_boxes(minicross.dataset.node_id);
        };
        container.append(minicross);
        container.onmouseover = function($) {
          return minicross.style.visibility = 'visible';
        };
        container.onmouseout = function($) {
          return minicross.style.visibility = 'hidden';
        };
        return container;
      }

      remove_from_select_boxes(node_id) {
        select_boxes = select_boxes.filter(function(elem) {
          return elem !== node_id;
        });
        return this.update();
      }

      generate_plaintext_query() {
        /** warning: VERY HACKY */
        var count, d, elem, j, k, l, len, len1, len2, ref, ref1, result;
        result = "Select ";
        if (select_boxes.length === 0) {
          result += '*';
        } else {
          for (j = 0, len = select_boxes.length; j < len; j++) {
            elem = select_boxes[j];
            result += '?' + elem + ' ';
          }
        }
        result += '\r\nwhere {';
        ref = document.getElementsByClassName('q_line');
        for (k = 0, len1 = ref.length; k < len1; k++) {
          elem = ref[k];
          result += '\r\n';
          count = 0;
          ref1 = elem.getElementsByClassName('highlighting_box');
          for (l = 0, len2 = ref1.length; l < len2; l++) {
            d = ref1[l];
            result += d.innerHTML + ' ';
            count += 1;
            if (count % 3 === 0) {
              result += ' .\r\n';
            }
          }
        }
        result += '}';
        console.log(result);
        return result;
      }

      copy_to_clipboard() {
        /** ugly hack to make you able to copy text to clipboard.
        */
        var thing, tmp_div;
        tmp_div = document.createElement('textarea');
        tmp_div.value = this.generate_plaintext_query();
        tmp_div.id = "tmp_div";
        document.body.appendChild(tmp_div);
        thing = document.getElementById('tmp_div');
        thing.select();
        document.execCommand('Copy');
        tmp_div.style.display = 'none';
        return document.body.removeChild(tmp_div);
      }

      add_filter(node) {
        this.filters.push(new window.QueryFilter(node));
        return this.update();
      }

      update() {
        var count, drake, elem, f_string, filter, filter_button, init_string, j, k, l, len, len1, len2, link, query_line, ref, ref1, s_line, select_div, select_div_f;
        div_sparql_text.innerHTML = "";
        init_string = document.createElement('div');
        init_string.className = "init_string";
        s_line = document.createElement('div');
        s_line.className = "s_line";
        if (select_boxes.length === 0) {
          s_line.innerHTML = "&nbsp;*";
        } else {
          s_line.append(this.create_tab());
          count = 0;
          for (j = 0, len = select_boxes.length; j < len; j++) {
            elem = select_boxes[j];
            if (this.cy.getElementById(elem).id() !== void 0) {
              s_line.append(this.create_highlighting_box(this.cy.getElementById(elem)));
              count += 1;
            }
          }
        }
        select_div = document.createElement('div');
        select_div.innerHTML = "Select ";
        init_string.append(select_div);
        init_string.append(s_line);
        init_string.append(document.createElement('br'));
        select_div_f = document.createElement('div');
        select_div_f.innerHTML = " where {";
        init_string.append(select_div_f);
        div_sparql_text.append(init_string);
        ref = this.links;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          link = ref[k];
          query_line = new window.QueryLine(link, this);
          div_sparql_text.append(query_line.to_html());
        }
        ref1 = this.filters;
        for (l = 0, len2 = ref1.length; l < len2; l++) {
          filter = ref1[l];
          div_sparql_text.append(filter.to_html());
        }
        f_string = document.createElement('div');
        f_string.style.display = 'inline-block';
        f_string.style.marginRight = '5px';
        f_string.innerHTML = '} ';
        div_sparql_text.append(f_string);
        filter_button = document.createElement('div');
        filter_button.className = 'filter_button';
        filter_button.innerHTML = '+ filter';
        filter_button.onclick = () => {
          return this.add_filter();
        };
        div_sparql_text.append(filter_button);
        dragula([s_line]);
        drake = dragula([s_line, document.getElementsByClassName('q_line')[0]], {
          copy: true
        });
        return drake.on('drop', () => {
          var len3, m, ref2;
          console.log('drop');
          this.select_boxes = [];
          ref2 = s_line.children;
          for (m = 0, len3 = ref2.length; m < len3; m++) {
            elem = ref2[m];
            if (elem.firstChild.dataset !== void 0) {
              this.select_boxes.push(elem.firstChild.dataset.node_id);
            }
          }
          //@update()
          return console.log(this.select_boxes);
        });
      }

    };

    select_boxes = [];

    div_sparql_text = null;

    cy = null;

    links = null;

    return SparqlText;

  }).call(this);

}).call(this);

(function() {
  window.Void = class Void {
    constructor() {
      this.to_html = this.to_html.bind(this);
      this.div = document.createElement('div');
      this.div.className = 'void_box';
      this.div.innerHTML = "&nbsp;&nbsp;&nbsp;";
    }

    to_html() {
      return this.div;
    }

  };

}).call(this);
