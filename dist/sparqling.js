// solarized palette
var palette, state_buffer_max_length;

palette = ["b58900", "cb4b16", "dc322f", "d33682", "6c71c4", "268bd2", "2aa198", "859900"];

// number of max save states for the undo function
state_buffer_max_length = 20;

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

window.QueryFilter = class QueryFilter {
  constructor(sparql_text, node) {
    this.new_condition = this.new_condition.bind(this);
    this.to_string = this.to_string.bind(this);
    this.to_html = this.to_html.bind(this);
    this.delete = this.delete.bind(this);
    this.node1 = node;
    this.node2 = null;
    this.v1_val = null;
    this.v2_val = null;
    this.datatype = "^^xsd:string";
    this.operator_sym = ">=";
    this.sparql_text = sparql_text;
    this.conditions = [];
    this.conditions.push(this.new_condition());
    this.slots = [];
  }

  new_condition() {
    var d, hl_box, operator, value;
    this.slots = [];
    if (this.node1 !== void 0 && this.node1 !== null) {
      this.node1.addClass('filtered');
    }
    if (this.node2 !== void 0 && this.node2 !== null) {
      this.node2.addClass('filtered');
    }
    d = document.createElement('div');
    d.style.display = 'flex';
    if (this.node1 !== void 0 && this.node1 !== null) {
      hl_box = new window.HlBox(this.node1);
      d.appendChild(hl_box.to_html());
      this.slots.push(hl_box);
    } else {
      this.v = new window.Void(this, 0, this.v1_val);
      this.v.div.addEventListener('input', () => {
        console.log(this.v.div.innerHTML);
        this.v1_val = this.v.div.innerHTML;
        return this.v.val = this.v.div.innerHTML;
      });
      d.appendChild(this.v.to_html());
      this.slots.push(this.v);
    }
    operator = document.createElement('div');
    operator.innerHTML = this.operator_sym;
    operator.style.marginLeft = '5px';
    operator.style.marginRight = '5px';
    operator.contentEditable = 'true';
    operator.addEventListener('input', () => {
      return this.operator_sym = operator.innerHTML;
    });
    d.appendChild(operator);
    if (this.node2 !== void 0 && this.node2 !== null) {
      hl_box = new window.HlBox(this.node2);
      d.appendChild(hl_box.to_html());
      this.slots.push(hl_box);
    } else {
      this.v = new window.Void(this, 1, this.v2_val);
      this.v.div.addEventListener('input', () => {
        this.v2_val = this.v.div.innerHTML;
        return this.v.val = this.v.div.innerHTML;
      });
      d.appendChild(this.v.to_html());
      this.slots.push(this.v);
    }
    value = document.createElement('div');
    value.style.marginLeft = '5px';
    value.style.marginRight = '5px';
    value.innerHTML = this.datatype;
    value.contentEditable = 'true';
    value.addEventListener('input', () => {
      return this.datatype = value.innerHTML;
    });
    d.appendChild(value);
    return d;
  }

  to_string() {
    var result;
    result = 'filter (';
    if (this.slots[0] instanceof HlBox) {
      if (this.node1 !== void 0 && this.node1 !== null) {
        result += ' ' + this.node1.id();
      }
    } else if (this.v1_val !== null) {
      result += this.v1_val;
    } else {
      return '';
    }
    if (this.operator_sym !== void 0 && this.operator_sym !== null) {
      result += ' ' + this.operator_sym;
    }
    if (this.slots[1] instanceof HlBox) {
      if (this.node2 !== void 0 && this.node2 !== null) {
        result += ' ' + this.node2.id();
      }
    } else if (this.v2_val !== null) {
      result += this.v2_val;
    } else {
      return '';
    }
    if (this.datatype !== void 0 && this.datatype !== null) {
      result += ' ' + this.datatype;
    }
    return result + ' )';
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
      conditions_container.appendChild(this.new_condition());
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
      return this.delete();
    };
    result_div.append(remove_button);
    result_div.onmouseover = function() {
      return remove_button.style.visibility = 'visible';
    };
    result_div.onmouseout = function() {
      return remove_button.style.visibility = 'hidden';
    };
    return result_div;
  }

  delete() {
    var index;
    index = this.sparql_text.filters.indexOf(this);
    if (this.node1 !== void 0 && this.node1 !== null) {
      this.node1.removeClass('filtered');
    }
    if (this.node2 !== void 0 && this.node2 !== null) {
      this.node2.removeClass('filtered');
    }
    this.sparql_text.filters.splice(index, 1);
    return this.sparql_text.update();
  }

};

window.QueryLine = class QueryLine {
  constructor(link, sparql_text) {
    this.to_html = this.to_html.bind(this);
    this.create_highlighting_box = this.create_highlighting_box.bind(this);
    this.link = link;
    console.log(this.link);
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
    q_line.onmouseover = function() {
      return button_div.style.visibility = 'visible';
    };
    q_line.onmouseout = function() {
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
      setTimeout(function() {
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

window.QueryLoader = class QueryLoader {
  constructor(context) {
    this.check_existence = this.check_existence.bind(this);
    this.remove_prefix = this.remove_prefix.bind(this);
    this.is_valid_triple = this.is_valid_triple.bind(this);
    this.is_concept_triple = this.is_concept_triple.bind(this);
    this.load = this.load.bind(this);
    this.context = context;
    this.cy = this.context.graph.cy;
    this.sparql_text = this.context.graph.sparql_text;
    this.color_index = this.context.graph.color_index;
    this.links = this.context.graph.links;
  }

  check_existence(label) {
    var compare_label, i, len, node, ref;
    ref = this.context.graphol.predicates;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      if (node.data('label') === void 0) {
        continue;
      }
      if (node.data('label').indexOf(':') !== -1) {
        compare_label = node.data('label').split(':')[1];
      } else {
        compare_label = node.data('label');
      }
      compare_label = compare_label.replace(/[\n\r]+/g, '').replace(/^\s+|\s+$/, '');
      if (label === compare_label) {
        return true;
      }
    }
    this.context.alert.say('node ' + label + ' does not exist in current ontology, invalid query');
    return false;
  }

  remove_prefix(s) {
    return s.split('#')[1];
  }

  is_valid_triple(triple) {
    if (this.is_concept_triple(triple)) {
      if (this.check_existence(this.remove_prefix(triple['object']))) {
        return true;
      }
    } else {
      if (this.check_existence(this.remove_prefix(triple['predicate']))) {
        return true;
      }
    }
    return false;
  }

  is_concept_triple(triple) {
    if (triple['predicate'] === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
      return true;
    } else {
      return false;
    }
  }

  load(plaintext_query) {
    var i, len, link, obj, parsed_query, ref, subj, triple;
    parsed_query = window.sparqljs.Parser().parse(plaintext_query);
    ref = parsed_query['where'][0]['triples'];
    for (i = 0, len = ref.length; i < len; i++) {
      triple = ref[i];
      if (!this.is_valid_triple(triple)) {
        return;
      }
      // if subject does not already exist in current query
      if (this.cy.getElementById(triple['subject'].slice(1)).length === 0) {
        subj = this.cy.add({
          group: 'nodes',
          classes: 'node-variable',
          data: {
            id: triple['subject'].slice(1),
            label: '?' + triple['subject'],
            color: '#' + palette[this.color_index % palette.length],
            links: []
          }
        });
        this.color_index += 1;
        subj = subj[0];
      } else {
        subj = this.cy.getElementById(triple['subject'].slice(1));
      }
      // if object is a variable
      if (triple['object'].charAt(0) === '?') {
        if (this.cy.getElementById(triple['object'].slice(1)).length === 0) {
          obj = this.cy.add({
            group: 'nodes',
            classes: 'node-variable',
            data: {
              id: triple['object'].slice(1),
              label: triple['object'],
              color: '#' + palette[this.color_index % palette.length],
              links: []
            }
          });
          obj = obj[0];
          this.color_index += 1;
        } else {
          obj = this.cy.getElementById(triple['object'].slice(1));
        }
      } else {
        obj = this.cy.add({
          group: 'nodes',
          classes: 'node-constant-value',
          data: {
            id: triple['object'],
            label: triple['object'],
            color: '#aaa',
            links: []
          }
        });
        obj = obj[0];
      }
      $.each(parsed_query['prefixes'], (elem) => {
        if (triple['predicate'].indexOf(parsed_query['prefixes'][elem]) !== -1) {
          return triple['predicate'] = triple['predicate'].substr(parsed_query['prefixes'][elem].length);
        }
      });
      link = new PainlessLink(this, this.cy, triple['predicate'], 'role', subj, obj);
      this.links.push(link);
    }
    $.each(parsed_query['variables'], (elem) => {
      return this.sparql_text.select_boxes.push(parsed_query['variables'][elem].slice(1));
    });
    this.context.graph.reshape();
    return this.sparql_text.update();
  }

};

//_require query_filter.coffee
window.SparqlText = (function() {
  var cy, div_sparql_text, instance, links, select_boxes;

  class SparqlText {
    constructor(cy, links) {
      this.create_highlighting_box = this.create_highlighting_box.bind(this);
      this.remove_from_select_boxes = this.remove_from_select_boxes.bind(this);
      this.generate_plaintext_query = this.generate_plaintext_query.bind(this);
      this.copy_to_clipboard = this.copy_to_clipboard.bind(this);
      this.add_filter = this.add_filter.bind(this);
      this.update = this.update.bind(this);
      if (instance) {
        return instance;
      } else {
        div_sparql_text = document.getElementById('sparql_textbox');
        div_sparql_text.className = "unselectable";
        this.div_sparql_text = div_sparql_text;
        this.select_boxes = select_boxes;
        this.cy = cy;
        this.links = links;
        this.filters = [];
        instance = this;
      }
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
        setTimeout(function() {
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
        console.log('a');
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
      console.log(this.select_boxes);
      this.select_boxes = this.select_boxes.filter(function(elem) {
        return elem !== node_id;
      });
      return this.update();
    }

    generate_plaintext_query() {
      var elem, filter, j, k, l, len, len1, len2, link, ref, ref1, result;
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
      ref = this.links;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        link = ref[k];
        result += '\r\n';
        result += link.to_string();
      }
      ref1 = this.filters;
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        filter = ref1[l];
        result += '\r\n';
        result += filter.to_string();
      }
      result += '\r\n}';
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
      this.filters.push(new window.QueryFilter(this, node));
      return this.update();
    }

    update() {
      var containers, count, drake, elem, f_string, filter, filter_button, init_string, j, k, l, len, len1, len2, link, query_line, ref, ref1, ref2, s_line, select_div, select_div_f;
      div_sparql_text.innerHTML = "";
      init_string = document.createElement('div');
      init_string.className = "init_string";
      s_line = document.createElement('div');
      s_line.className = "s_line";
      if (this.select_boxes.length === 0) {
        s_line.innerHTML = "&nbsp;*";
      } else {
        s_line.append(this.create_tab());
        count = 0;
        ref = this.select_boxes;
        for (j = 0, len = ref.length; j < len; j++) {
          elem = ref[j];
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
      ref1 = this.links;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        link = ref1[k];
        query_line = new window.QueryLine(link, this);
        div_sparql_text.append(query_line.to_html());
      }
      ref2 = this.filters;
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        filter = ref2[l];
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
      containers = Array.prototype.slice.call(document.getElementsByClassName('q_line')).concat(Array.prototype.slice.call(document.getElementsByClassName('void_box'))).concat(s_line);
      drake = dragula({
        containers: containers,
        copy: (el, source) => {
          if (source.classList.contains('q_line')) {
            return true;
          } else {
            return false;
          }
        },
        accepts: function(el, target, source) {
          if (target.classList.contains('q_line') && source.classList.contains('q_line')) {
            return false;
          }
          if (target.classList.contains('void_box')) {
            target.innerHTML.replace('&nbsp;', '');
          }
          return true;
        },
        invalid: function(el, handle) {
          if (el.classList.contains('highlighting_box') || el.classList.contains('highlighting_box_container')) {
            return false;
          } else {
            return true;
          }
        },
        revertOnSpill: true
      });
      return drake.on('drop', (el, target) => {
        var child, len3, m, ref3;
        if (target.classList.contains('void_box')) {
          if (target.dataset.filter_position === '0') {
            $(target).data('parent').node1 = this.cy.getElementById(el.firstChild.dataset.node_id);
            $(target).data('parent').conditions = [];
            $(target).data('parent').conditions.push($(target).data('parent').new_condition());
          } else if (target.dataset.filter_position === '1') {
            $(target).data('parent').node2 = this.cy.getElementById(el.firstChild.dataset.node_id);
            $(target).data('parent').conditions = [];
            $(target).data('parent').conditions.push($(target).data('parent').new_condition());
          }
        }
        this.select_boxes = [];
        ref3 = s_line.children;
        for (m = 0, len3 = ref3.length; m < len3; m++) {
          child = ref3[m];
          if (child.firstChild.innerHTML !== void 0) {
            this.select_boxes.push(child.firstChild.innerHTML.substr(1));
          }
        }
        return this.update();
      });
    }

  };

  instance = null;

  select_boxes = [];

  div_sparql_text = null;

  cy = null;

  links = null;

  return SparqlText;

}).call(this);

// Main class of the application, keeps together all the different components,
// and defines the interaction with the grapholscape graph.
window.Sparqling = (function() {
  var instance, tappedBefore, tappedTimeout;

  class Sparqling {
    // note that __@graphol_cy__ is the cytoscape instance from grapholscape,
    // while __@cy__ is the new instance created by sparqling to represent the query.
    constructor(graph) {
      // Add the __selected node__ in grapholscape to the query,
      // according to the type of the node (stored in node.data('type')).
      // Nodes can be 'role', 'attribute' or 'concept'
      this.add_to_query = this.add_to_query.bind(this);
      // extracts the attribute type from the grapholscape graph
      this.extract_datatype = this.extract_datatype.bind(this);
      // debug bindings - to be removed
      this.onkeypress_handler = this.onkeypress_handler.bind(this);
      // since cytoscape does not emit doubleclick events, we create one based on the tap event.
      this.doubleclick_handler = this.doubleclick_handler.bind(this);
      if (instance) {
        return instance;
      } else {
        this.graphol = graph;
        this.graphol_cy = graph.cy;
        instance = this;
        this.init();
      }
    }

    init() {
      this.sidenav = new SparqlingNavbar(this);
      this.graph = new SparqlingGraph(this);
      this.menu = new SparqlingMenu(this);
      this.loader = new QueryLoader(this);
      this.alert = new SparqlingAlert;
      this.sparql_text = this.graph.sparql_text;
      return this.add_event_listener();
    }

    add_to_query() {
      var selected_node;
      selected_node = this.graphol_cy.nodes(":selected");
      if (selected_node.length === 0) {
        this.alert.say("please, select a node in the main graph");
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

    onkeypress_handler(event) {
      var i, len, link, ref, results;
      if (event.key === "d") {
        console.log(this.graph.cy.nodes(":selected").data('links'));
      }
      if (event.key === "c") {
        return console.log(this.graph.links);
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

    doubleclick_handler(event) {
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
    }

    add_event_listener() {
      // keypress handler
      window.addEventListener('keypress', (event) => {
        return this.onkeypress_handler(event);
      });
      // fix sizes on window resize
      window.addEventListener('resize', () => {
        this.sidenav.resize_navbar();
        return this.menu.change_size(50);
      });
      // doubleclick handler on grapholscape
      return this.graphol_cy.on('tap', (event) => {
        return this.doubleclick_handler(event);
      });
    }

  };

  instance = null;

  // __tappedBefore__ and __tappedTimeout__ are doubleclick timers
  tappedBefore = null;

  tappedTimeout = null;

  return Sparqling;

}).call(this);

window.SparqlingAlert = (function() {
  var instance;

  class SparqlingAlert {
    constructor() {
      this.say = this.say.bind(this);
      this.dialog = document.createElement('div');
      this.dialog.className = 'sparqling_dialog';
      this.dialog.style.opacity = '0';
      this.dialog.style.bottom = '5%';
      document.getElementById("grapholscape-container").append(this.dialog);
    }

    say(msg) {
      this.dialog.innerHTML = msg;
      this.dialog.style.opacity = '1';
      this.dialog.onmouseover = () => {
        return setTimeout((() => {
          return this.dialog.style.opacity = '0';
        }), 300);
      };
      return setTimeout((() => {
        return this.dialog.style.opacity = '0';
      }), 3000);
    }

  };

  instance = null;

  SparqlingAlert.dialog = null;

  return SparqlingAlert;

}).call(this);

window.PainlessContextMenu = class PainlessContextMenu {
  constructor(cy, context) {
    this.init = this.init.bind(this);
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
          select: function(ele) {
            return ele.data('links')[0].reverse();
          }
        },
        {
          content: 'delete',
          select: function(ele) {
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
        },
        {
          content: 'filter',
          select: (ele) => {
            return this.context.sparql_text.add_filter(ele);
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

/*!
 * jQuery JavaScript Library v3.3.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2018-01-20T17:24Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};




	var preservedScriptAttributes = {
		type: true,
		src: true,
		noModule: true
	};

	function DOMEval( code, doc, node ) {
		doc = doc || document;

		var i,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {
				if ( node[ i ] ) {
					script[ i ] = node[ i ];
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.3.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {

		/* eslint-disable no-unused-vars */
		// See https://github.com/eslint/eslint/issues/6125
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	disabledAncestor = addCombinator(
		function( elem ) {
			return elem.disabled === true && ("form" in elem || "label" in elem);
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						disabledAncestor( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
        if ( nodeName( elem, "iframe" ) ) {
            return elem.contentDocument;
        }

        // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
        // Treat the template element as a regular one in browsers that
        // don't support it.
        if ( nodeName( elem, "template" ) ) {
            elem = elem.content || elem;
        }

        return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains( elem.ownerDocument, elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();
var documentElement = document.documentElement;



var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), doc, node );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		div.style.position = "absolute";
		scrollboxSizeVal = div.offsetWidth === 36 || "absolute";

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a property mapped along what jQuery.cssProps suggests or to
// a vendor prefixed property.
function finalPropName( name ) {
	var ret = jQuery.cssProps[ name ];
	if ( !ret ) {
		ret = jQuery.cssProps[ name ] = vendorPropName( name ) || name;
	}
	return ret;
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5
		) );
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),
		val = curCSS( elem, dimension, styles ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox;

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}

	// Check for style in case a browser which returns unreliable values
	// for getComputedStyle silently falls back to the reliable elem.style
	valueIsBorderBox = valueIsBorderBox &&
		( support.boxSizingReliable() || val === elem.style[ dimension ] );

	// Fall back to offsetWidth/offsetHeight when value is "auto"
	// This happens for inline elements with no explicit setting (gh-3571)
	// Support: Android <=4.1 - 4.3 only
	// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
	if ( val === "auto" ||
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) {

		val = elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ];

		// offsetWidth/offsetHeight provide border-box values
		valueIsBorderBox = true;
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),
				isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra && boxModelAdjustment(
					elem,
					dimension,
					extra,
					isBorderBox,
					styles
				);

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && support.scrollboxSize() === styles.position ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = Date.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

// Manages the visualization of the cytoscape graph, plus some interactions
window.SparqlingGraph = (function() {
  var state_buffer;

  class SparqlingGraph {
    constructor(context) {
      
      // resets node positions in the graph view
      this.reshape = this.reshape.bind(this);
      // downloads the whole state of cytoscape. TODO: not useful.
      this.download = this.download.bind(this);
      this.clear_all = this.clear_all.bind(this);
      // if __ele__ is null, visualizes the whole graph.
      // if __ele__ is not null, focuses the view on __ele__
      this.center_view = this.center_view.bind(this);
      this.add_to_select = this.add_to_select.bind(this);
      this.reverse_relationship = this.reverse_relationship.bind(this);
      // adds a new link in the graph.    
      // links that are not concepts (roles and attributes) add a new variable into the graph.   
      // links are always added to the selected variable in the graph, if there are no selected variables,
      // two new variables are created.   
      // links can be:
      // - concepts   
      // - roles
      // - attributes   

      // TODO: use an enum to represent link types instead of hardcoded strings
      this.add_link = this.add_link.bind(this);
      // check if there are any collisions in all the node variables
      // returns the colliding nodes if there are any.

      // TODO: collision highlight is broken!
      // TODO: remove hardcoded collision distance threshold
      this.check_collisions = this.check_collisions.bind(this);
      this.init = this.init.bind(this);
      this.utils = new window.PainlessUtils();
      this.context = context;
      this.links = [];
      this.layout_names = ['cola', 'cose-bilkent', 'circle', 'cose', 'grid', 'breadthfirst', 'concentric'];
      this.layout_index = 0;
      this.init();
      this.reshape();
      
      // TODO: sparql_text should be managed by sparqling.coffee
      this.sparql_text = new SparqlText(this.cy, this.links);
      this.sparql_text.update();
      // TODO: this too should be managed by main class
      new window.PainlessContextMenu(this.cy, this);
      this.color_index = 0;
    }

    reshape() {
      this.layout = this.layout_names[this.layout_index % this.layout_names.length];
      return this.cy.layout({
        name: this.layout,
        fit: false,
        animate: true,
        nodeDimensionsIncludeLabels: true,
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
        return setTimeout(function() {
          document.body.removeChild(a);
          return window.URL.revokeObjectURL(url);
        }, 0);
      }
    }

    clear_all() {
      var e, i, len, link, ref;
      ref = this.links;
      for (i = 0, len = ref.length; i < len; i++) {
        link = ref[i];
        try {
          link.delete();
        } catch (error) {
          e = error;
          console.log(link);
        }
      }
      this.cy.remove(this.cy.nodes());
      this.cy.remove(this.cy.edges());
      this.links = [];
      this.sparql_text.filters = [];
      return this.sparql_text.update();
    }

    center_view(ele = null) {
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
        return this.context.alert("no saved states");
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

    // merges node1 and node2, repositioning all node2's edges into node1.
    // __node2__ is the node that is carried on top of the other.
    merge(node1, node2) {
      var i, len, link, ref;
      this.save_state();
      ref = node2.data('links');
      for (i = 0, len = ref.length; i < len; i++) {
        link = ref[i];
        link.switch_node(node2, node1);
      }
      this.cy.remove(node2);
      this.sparql_text.update();
      return this.reshape();
    }

    add_link(link_name, link_type, datatype) {
      /** if a var node is selected, the link is added to the var node and one new var node is created*/
      var i, len, link, node, ref;
      ref = this.context.graphol_cy.nodes();
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (node.data('label') === link_name) {
          node.style('border-color', '#e38400');
          node.style('border-width', '5px');
        }
      }
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
      this.links.push(link);
      this.sparql_text.update();
      return this.reshape();
    }

    
    // computes distance between two node positions
    compute_distance(node1, node2) {
      var a, b;
      a = Math.abs(node1.position('x') - node2.position('x'));
      b = Math.abs(node1.position('y') - node2.position('y'));
      return Math.sqrt(a * a + b * b);
    }

    check_collisions() {
      var i, j, len, len1, node, node2, ref, ref1;
      ref = this.cy.nodes(".node-variable");
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

  return SparqlingGraph;

}).call(this);

//_require constants.coffee
window.PainlessLink = class PainlessLink {
  constructor(context, cy, link_name, link_type, node_var1 = null, node_var2 = null, datatype) {
    this.create_edge = this.create_edge.bind(this);
    this.reverse = this.reverse.bind(this);
    this.add_datatype = this.add_datatype.bind(this);
    this.create_node = this.create_node.bind(this);
    this.delete = this.delete.bind(this);
    // This function switches a node with another one. It is used when merging two nodes.
    // __node1__ is the node that gets deleted
    this.switch_node = this.switch_node.bind(this);
    this.create_link = this.create_link.bind(this);
    this.create_concept = this.create_concept.bind(this);
    this.to_string = this.to_string.bind(this);
    this.cy = cy;
    this.context = context;
    this.link_name = link_name;
    this.link_type = link_type;
    this.node_var1 = node_var1;
    this.node_var2 = node_var2;
    this.edge_source = null;
    this.edge_target = null;
    this.datatype = datatype;
    this.datatype_node = null;
    if (this.link_name !== void 0 && this.link_name !== null) {
      this.link_name = this.link_name.replace("\n", "").replace("\r", "").replace(" ", "");
    }
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
      data['color'] = '#' + palette[this.context.color_index % palette.length];
      this.context.color_index += 1;
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
    var i, index, j, k, l, len, len1, node, node_var, ref, ref1, ref2;
    index = this.context.links.indexOf(this);
    this.context.links.splice(index, 1);
    this.context.sparql_text.update();
    ref = this.context.context.graphol_cy.nodes();
    for (j = 0, len = ref.length; j < len; j++) {
      node = ref[j];
      console.log(node.data('label'));
      console.log("link name: " + this.link_name);
      console.log(node.data('label') === this.link_name);
      if (node.data('label') === this.link_name) {
        node.style('border-color', 'black');
        node.style('border-width', '1px');
      }
    }
    if (this.node_link !== null && this.node_link !== void 0) {
      this.cy.remove(this.node_link);
    }
    if (this.node_concept !== null && this.node_concept !== void 0) {
      this.cy.remove(this.node_concept);
    }
    if (this.datatype_node !== null && this.datatype_node !== void 0) {
      this.cy.remove(this.datatype_node);
    }
    ref1 = [this.node_var1, this.node_var2];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      node_var = ref1[k];
      if (node_var !== null && node_var !== void 0) {
        index = node_var.data('links').indexOf(this);
        node_var.data('links').splice(index, 1);
        if (node_var.data('links').length === 0) {
          for (i = l = 0, ref2 = this.context.sparql_text.select_boxes.length; (0 <= ref2 ? l < ref2 : l > ref2); i = 0 <= ref2 ? ++l : --l) {
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

  switch_node(node1, node2) {
    if (node1.id() === this.node_var1.id()) {
      this.node_var1 = node2;
    } else if (node1.id() === this.node_var2.id()) {
      this.node_var2 = node2;
    }
    if (this.link_type === 'concept') {
      this.create_edge(this.node_var1, this.node_concept, 'edge-concept');
    } else {
      if (node1.id() === this.source.id()) {
        this.source = node2;
        this.create_edge(this.node_link, this.source, "source-edge");
      } else if (node1.id() === this.target.id()) {
        this.target = node2;
        this.edge_target = this.create_edge(this.node_link, this.target, "target-edge");
      }
    }
    return node2.data('links').push(this);
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
    } else {
      this.node_var1.data('links').push(this);
    }
    this.node_concept = this.create_node('node-concept');
    return this.create_edge(this.node_var1, this.node_concept, 'edge-concept');
  }

  to_string() {
    if (this.link_type !== 'concept') {
      return this.source.data('label') + ' ' + this.link_name + ' ' + this.target.data('label') + ' .';
    } else {
      return this.node_var1.data('label') + ' rdf:type ' + this.node_concept.data('label') + ' .';
    }
  }

};

// define the behaviour of the menu buttons located over the query canvas
window.SparqlingMenu = class SparqlingMenu {
  constructor(context) {
    this.change_size = this.change_size.bind(this);
    this.create_navigation_div = this.create_navigation_div.bind(this);
    this.init = this.init.bind(this);
    this.context = context;
    this.init();
    this.change_size(50);
  }

  change_size(query_canvas_size) {
    var clientHeight, query_canvas_pixels;
    clientHeight = document.getElementById('cy').clientHeight;
    query_canvas_pixels = query_canvas_size * clientHeight / 100;
    this.context.sidenav.query_canvas.style.height = query_canvas_pixels + "px";
    sparql_textbox.style.height = Math.max(clientHeight - 100 - query_canvas_pixels, 0) + "px";
    return setTimeout(() => {
      return this.context.graph.cy.resize();
    }, 550);
  }

  create_div(innerHTML = null, className = null, id = null, onclick = null, tooltip = null) {
    var div, span;
    div = document.createElement('div');
    div.innerHTML = innerHTML;
    div.className = className + ' grapholscape-tooltip';
    div.id = id;
    div.onclick = onclick;
    if (tooltip !== null) {
      span = document.createElement('span');
      span.innerHTML = tooltip;
      span.className = 'tooltiptext';
      span.style.display = 'none';
      div.append(span);
      div.onmouseover = () => {
        return span.style.display = 'block';
      };
      div.onmouseout = () => {
        return span.style.display = 'none';
      };
    }
    return div;
  }

  create_navigation_div() {
    var nav_div;
    nav_div = this.create_div(null, null, 'nav_div');
    nav_div.append(this.create_div('▲', 'sparqling_resize_button', null, (() => {
      return this.change_size(90);
    }), 'expand graph'));
    nav_div.append(this.create_div('≡', 'sparqling_resize_button', null, (() => {
      return this.change_size(50);
    }), 'center'));
    nav_div.append(this.create_div('▼', 'sparqling_resize_button', null, (() => {
      return this.change_size(10);
    }), 'expand sparql'));
    return nav_div;
  }

  set_invisible() {
    var elem, i, j, len, len1, ref, ref1, results;
    ref = document.getElementsByClassName('sparqling_menu_button');
    for (i = 0, len = ref.length; i < len; i++) {
      elem = ref[i];
      elem.style.display = 'none';
    }
    ref1 = document.getElementsByClassName('sparqling_resize_button');
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      elem = ref1[j];
      results.push(elem.style.display = 'none');
    }
    return results;
  }

  set_visible() {
    var elem, i, j, len, len1, ref, ref1, results;
    ref = document.getElementsByClassName('sparqling_menu_button');
    for (i = 0, len = ref.length; i < len; i++) {
      elem = ref[i];
      elem.style.display = 'inline-block';
    }
    ref1 = document.getElementsByClassName('sparqling_resize_button');
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      elem = ref1[j];
      results.push(elem.style.display = 'inline-block');
    }
    return results;
  }

  init() {
    var menu, plaintext_query;
    menu = this.create_div(null, null, 'painless_menu');
    document.getElementById('sidenav').append(menu);
    menu.append(this.create_navigation_div());
    plaintext_query = 'PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX : <http://www.aci.it/ontology#> PREFIX xml: <http://www.w3.org/XML/1998/namespace> PREFIX aci: <http://www.aci.it/ontology#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> Select ?idVeicolo ?inizioStato ?fineStato ?idFormalitaGeneratrice ?idFormalitaOriginaria ?codiceFormalitaOriginaria ?dataAccettazioneFormalitaOriginaria ?ufficioCompetenteFormalitaOriginaria ?serieTarga ?numeroTarga ?serieTargaPrecedente ?numeroTargaPrecedente ?telaio ?kw ?cilindrata ?peso ?portata ?tara ?classe ?uso ?carrozzeria ?specialita ?alimentazione ?alimentazioneDTT ?dataImmatricolazione ?codiceUltimaFormalitaDiParte ?dataUltimaFormalitaDiParte where { ?veicolo aci:ID_veicolo ?idVeicolo. ?veicolo aci:ha_stato_di_veicolo ?stato. ?stato a aci:Stato_rappresentato_valido. ?stato aci:ha_targa ?targa. ?targa aci:numero_targa ?numeroTarga. ?targa aci:serie_targa ?serieTarga. ?stato aci:ha_formalita_originaria ?formalitaOriginaria. ?formalitaOriginaria aci:ID_formalita ?idFormalitaOriginaria. ?formalitaOriginaria aci:codice_tipo ?codiceFormalitaOriginaria. ?evento aci:determina_stato ?stato. ?formalitaGeneratrice aci:formalita_genera_evento ?evento. ?formalitaGeneratrice aci:ID_formalita ?idFormalitaGeneratrice. ?stato aci:inizio_stato_del_mondo ?inizioStato. ?stato aci:fine_stato_del_mondo ?fineStato. ?formalitaOriginaria aci:data_accettazione_formalita ?dataAccettazioneFormalitaOriginaria. ?formalitaOriginaria aci:est_di_competenza_di_ufficio ?ufficio. ?ufficio aci:descrizione_ufficio ?ufficioCompetenteFormalitaOriginaria. ?stato aci:codice_tipo_ultima_formalita_di_parte ?codiceUltimaFormalitaDiParte. ?stato aci:data_accettazione_ultima_formalita_di_parte ?dataUltimaFormalitaDiParte. ?stato aci:ha_targa_precedente ?targaPrecedente. ?targaPrecedente aci:numero_targa ?numeroTargaPrecedente. ?targaPrecedente  aci:serie_targa ?serieTargaPrecedente. ?stato aci:numero_telaio ?telaio. ?stato aci:kw ?kw. ?stato aci:cilindrata ?cilindrata. ?stato aci:peso_complessivo ?peso. ?stato aci:portata ?portata. ?stato aci:tara ?tara. ?stato aci:classe_veicolo ?classe. ?stato aci:destinazione_di_uso ?uso. ?stato aci:carrozzeria ?carrozzeria. ?stato aci:descrizione_specialita ?specialita. ?stato aci:data_immatricolazione ?dataImmatricolazione. ?stato aci:alimentazione ?alimentazione. ?stato aci:alimentazione_DTT ?alimentazioneDTT. }';
    menu.append(this.create_div('<i class="material-icons" style="font-size: 18px">undo</i>', 'sparqling_menu_button', null, (() => {
      return this.context.graph.undo();
    }), 'undo'));
    menu.append(this.create_div('<i class="material-icons" style="font-size: 18px">filter_center_focus</i>', 'sparqling_menu_button', null, (() => {
      return this.context.graph.center_view();
    }), 'center view'));
    menu.append(this.create_div('<i class="material-icons" style="font-size: 18px">file_copy</i>', 'sparqling_menu_button', null, (() => {
      return this.context.graph.copy_to_clipboard();
    }), 'copy to clipboard'));
    //menu.append(@create_div('<i class="material-icons" style="font-size: 18px">save</i>',                 'sparqling_menu_button', null, ( => @context.graph.download()), 'export'))
    menu.append(this.create_div('<i class="material-icons" style="font-size: 18px">open_in_browser</i>', 'sparqling_menu_button', null, (() => {
      return this.context.loader.load(plaintext_query);
    }), 'import'));
    return menu.append(this.create_div('<i class="material-icons" style="font-size: 18px">clear_all</i>', 'sparqling_menu_button', null, (() => {
      return this.context.graph.clear_all();
    }), 'clear all'));
  }

};

window.SparqlingNavbar = (function() {
  var cur_sidenav_size;

  class SparqlingNavbar {
    constructor(context) {
      this.create_sidenav = this.create_sidenav.bind(this);
      this.resize_navbar = this.resize_navbar.bind(this);
      this.context = context;
      this.create_sidenav();
    }

    create_sidenav() {
      var button, slider, slider_button, sparql_textbox;
      this.side_nav_container = document.createElement("div");
      this.side_nav_container.id = "sidenav_container";
      this.grapholscape_container = document.getElementById("grapholscape-container");
      this.grapholscape_container.appendChild(this.side_nav_container);
      this.context.graphol_cy.resize();
      slider = document.createElement("div");
      slider.id = 'slider';
      sidenav_container.appendChild(slider);
      slider_button = document.createElement('div');
      slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_left</i>';
      slider_button.className = 'slider_button';
      slider_button.onclick = () => {
        return this.resize_navbar(cur_sidenav_size + 25);
      };
      slider.appendChild(slider_button);
      slider_button = document.createElement('div');
      slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_right</i>';
      slider_button.className = 'slider_button';
      slider_button.onclick = () => {
        return this.resize_navbar(cur_sidenav_size - 25);
      };
      slider.appendChild(slider_button);
      button = document.createElement("div");
      button.innerHTML = '<i class="material-icons">add</i><p style="font-size:xx-small; margin-top: -5px">query</p>';
      button.className = "slider_button_down";
      button.onclick = () => {
        return this.context.add_to_query();
      };
      slider.appendChild(button);
      this.side_nav = document.createElement("div");
      this.side_nav.id = "sidenav";
      this.side_nav.style.width = cur_sidenav_size + '%';
      this.side_nav_container.appendChild(this.side_nav);
      sparql_textbox = document.createElement("div");
      sparql_textbox.id = "sparql_textbox";
      sparql_textbox.innerHTML = "sparql_query_here";
      this.side_nav.appendChild(sparql_textbox);
      this.query_canvas = document.createElement("div");
      this.query_canvas.id = "query_canvas";
      this.side_nav.appendChild(this.query_canvas);
      return this.resize_navbar();
    }

    resize_navbar(new_size = cur_sidenav_size) {
      var center_button, client_width, details, explorer, fullscreen, owl_translator, zoom_tools;
      cur_sidenav_size = new_size;
      if (cur_sidenav_size < 0) {
        cur_sidenav_size = 0;
      }
      if (cur_sidenav_size > 75) {
        cur_sidenav_size = 75;
      }
      client_width = this.grapholscape_container.clientWidth;
      center_button = document.getElementById('center_button');
      zoom_tools = document.getElementById('zoom_tools');
      owl_translator = document.getElementById('owl_translator');
      explorer = document.getElementById('explorer');
      details = document.getElementById('details');
      fullscreen = document.getElementById('grapholscape-fullscreen-btn');
      if (center_button !== void 0 && center_button !== null) {
        center_button.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px";
        center_button.style.transitionDuration = '0.1s';
      }
      if (zoom_tools !== void 0 && zoom_tools !== null) {
        zoom_tools.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px";
        zoom_tools.style.transitionDuration = '0.1s';
      }
      if (document.getElementById('cy') !== void 0 && document.getElementById('cy') !== null) {
        document.getElementById('cy').style.width = ((100 - cur_sidenav_size) * client_width / 100 + 0) + "px";
      }
      if (owl_translator !== void 0 && owl_translator !== null) {
        owl_translator.style.transitionDuration = '0.1s';
        owl_translator.style.left = (100 - cur_sidenav_size) / 2 + "%";
        if (cur_sidenav_size > 50) {
          owl_translator.style.display = 'none';
        } else {
          owl_translator.style.display = 'block';
        }
      }
      if (explorer !== void 0 && explorer !== null) {
        explorer.style.transitionDuration = '0.1s';
        explorer.style.left = (100 - cur_sidenav_size) / 2 + "%";
        if (cur_sidenav_size > 50) {
          explorer.style.display = 'none';
        } else {
          explorer.style.display = 'block';
        }
      }
      if (details !== void 0 && details !== null) {
        details.style.right = (cur_sidenav_size * client_width / 100 + 60) + "px";
        details.style.transitionDuration = '0.1s';
        if (cur_sidenav_size > 25) {
          details.style.display = 'none';
        } else {
          details.style.display = 'block';
        }
      }
      if (fullscreen !== void 0 && fullscreen !== null) {
        fullscreen.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px";
        fullscreen.style.transitionDuration = '0.1s';
      }
      if (cur_sidenav_size !== 100) {
        this.side_nav_container.style.width = (cur_sidenav_size * client_width / 100 + 30) + "px";
        this.side_nav.style.width = (cur_sidenav_size * client_width / 100) + "px";
      } else {
        this.side_nav_container.style.width = (cur_sidenav_size * client_width / 100) + "px";
        this.side_nav.style.width = (cur_sidenav_size * client_width / 100 - 30) + "px";
      }
      if (cur_sidenav_size === 0) {
        if (this.context.menu !== void 0) {
          this.context.menu.set_invisible();
          this.context.menu.change_size(50);
        }
      } else if (this.context.menu !== void 0) {
        this.context.menu.set_visible();
        this.context.menu.change_size(50);
      }
      this.context.graphol_cy.resize();
      return setTimeout(() => {
        return this.context.graph.cy.resize();
      }, 150);
    }

  };

  cur_sidenav_size = 0;

  return SparqlingNavbar;

}).call(this);

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
    }).selector('node.filtered').style({
      'border-color': '#ff0000',
      'border-opacity': '1',
      'border-width': '20px',
      'border-style': 'double'
    }).selector('node:selected').style({
      'border-color': '#daa',
      'border-opacity': '0.5',
      'border-width': '20px',
      'border-style': 'solid'
    });
  }

};

window.Void = class Void {
  constructor(parent, position, val) {
    this.to_html = this.to_html.bind(this);
    this.div = document.createElement('div');
    this.div.className = 'void_box';
    this.div.contentEditable = true;
    this.val = val;
    this.div.innerHTML = this.val;
    $(this.div).data('parent', parent);
    this.position = position;
    this.div.dataset.filter_position = position;
    this.div.style.transitionDuration = '0.1s';
  }

  to_html() {
    return this.div;
  }

};

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cola = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./src/adaptor"));
__export(require("./src/d3adaptor"));
__export(require("./src/descent"));
__export(require("./src/geom"));
__export(require("./src/gridrouter"));
__export(require("./src/handledisconnected"));
__export(require("./src/layout"));
__export(require("./src/layout3d"));
__export(require("./src/linklengths"));
__export(require("./src/powergraph"));
__export(require("./src/pqueue"));
__export(require("./src/rbtree"));
__export(require("./src/rectangle"));
__export(require("./src/shortestpaths"));
__export(require("./src/vpsc"));
__export(require("./src/batch"));

},{"./src/adaptor":2,"./src/batch":3,"./src/d3adaptor":4,"./src/descent":7,"./src/geom":8,"./src/gridrouter":9,"./src/handledisconnected":10,"./src/layout":11,"./src/layout3d":12,"./src/linklengths":13,"./src/powergraph":14,"./src/pqueue":15,"./src/rbtree":16,"./src/rectangle":17,"./src/shortestpaths":18,"./src/vpsc":19}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = require("./layout");
var LayoutAdaptor = (function (_super) {
    __extends(LayoutAdaptor, _super);
    function LayoutAdaptor(options) {
        var _this = _super.call(this) || this;
        var self = _this;
        var o = options;
        if (o.trigger) {
            _this.trigger = o.trigger;
        }
        if (o.kick) {
            _this.kick = o.kick;
        }
        if (o.drag) {
            _this.drag = o.drag;
        }
        if (o.on) {
            _this.on = o.on;
        }
        _this.dragstart = _this.dragStart = layout_1.Layout.dragStart;
        _this.dragend = _this.dragEnd = layout_1.Layout.dragEnd;
        return _this;
    }
    LayoutAdaptor.prototype.trigger = function (e) { };
    ;
    LayoutAdaptor.prototype.kick = function () { };
    ;
    LayoutAdaptor.prototype.drag = function () { };
    ;
    LayoutAdaptor.prototype.on = function (eventType, listener) { return this; };
    ;
    return LayoutAdaptor;
}(layout_1.Layout));
exports.LayoutAdaptor = LayoutAdaptor;
function adaptor(options) {
    return new LayoutAdaptor(options);
}
exports.adaptor = adaptor;

},{"./layout":11}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = require("./layout");
var gridrouter_1 = require("./gridrouter");
function gridify(pgLayout, nudgeGap, margin, groupMargin) {
    pgLayout.cola.start(0, 0, 0, 10, false);
    var gridrouter = route(pgLayout.cola.nodes(), pgLayout.cola.groups(), margin, groupMargin);
    return gridrouter.routeEdges(pgLayout.powerGraph.powerEdges, nudgeGap, function (e) { return e.source.routerNode.id; }, function (e) { return e.target.routerNode.id; });
}
exports.gridify = gridify;
function route(nodes, groups, margin, groupMargin) {
    nodes.forEach(function (d) {
        d.routerNode = {
            name: d.name,
            bounds: d.bounds.inflate(-margin)
        };
    });
    groups.forEach(function (d) {
        d.routerNode = {
            bounds: d.bounds.inflate(-groupMargin),
            children: (typeof d.groups !== 'undefined' ? d.groups.map(function (c) { return nodes.length + c.id; }) : [])
                .concat(typeof d.leaves !== 'undefined' ? d.leaves.map(function (c) { return c.index; }) : [])
        };
    });
    var gridRouterNodes = nodes.concat(groups).map(function (d, i) {
        d.routerNode.id = i;
        return d.routerNode;
    });
    return new gridrouter_1.GridRouter(gridRouterNodes, {
        getChildren: function (v) { return v.children; },
        getBounds: function (v) { return v.bounds; }
    }, margin - groupMargin);
}
function powerGraphGridLayout(graph, size, grouppadding) {
    var powerGraph;
    graph.nodes.forEach(function (v, i) { return v.index = i; });
    new layout_1.Layout()
        .avoidOverlaps(false)
        .nodes(graph.nodes)
        .links(graph.links)
        .powerGraphGroups(function (d) {
        powerGraph = d;
        powerGraph.groups.forEach(function (v) { return v.padding = grouppadding; });
    });
    var n = graph.nodes.length;
    var edges = [];
    var vs = graph.nodes.slice(0);
    vs.forEach(function (v, i) { return v.index = i; });
    powerGraph.groups.forEach(function (g) {
        var sourceInd = g.index = g.id + n;
        vs.push(g);
        if (typeof g.leaves !== 'undefined')
            g.leaves.forEach(function (v) { return edges.push({ source: sourceInd, target: v.index }); });
        if (typeof g.groups !== 'undefined')
            g.groups.forEach(function (gg) { return edges.push({ source: sourceInd, target: gg.id + n }); });
    });
    powerGraph.powerEdges.forEach(function (e) {
        edges.push({ source: e.source.index, target: e.target.index });
    });
    new layout_1.Layout()
        .size(size)
        .nodes(vs)
        .links(edges)
        .avoidOverlaps(false)
        .linkDistance(30)
        .symmetricDiffLinkLengths(5)
        .convergenceThreshold(1e-4)
        .start(100, 0, 0, 0, false);
    return {
        cola: new layout_1.Layout()
            .convergenceThreshold(1e-3)
            .size(size)
            .avoidOverlaps(true)
            .nodes(graph.nodes)
            .links(graph.links)
            .groupCompactness(1e-4)
            .linkDistance(30)
            .symmetricDiffLinkLengths(5)
            .powerGraphGroups(function (d) {
            powerGraph = d;
            powerGraph.groups.forEach(function (v) {
                v.padding = grouppadding;
            });
        }).start(50, 0, 100, 0, false),
        powerGraph: powerGraph
    };
}
exports.powerGraphGridLayout = powerGraphGridLayout;

},{"./gridrouter":9,"./layout":11}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3v3 = require("./d3v3adaptor");
var d3v4 = require("./d3v4adaptor");
;
function d3adaptor(d3Context) {
    if (!d3Context || isD3V3(d3Context)) {
        return new d3v3.D3StyleLayoutAdaptor();
    }
    return new d3v4.D3StyleLayoutAdaptor(d3Context);
}
exports.d3adaptor = d3adaptor;
function isD3V3(d3Context) {
    var v3exp = /^3\./;
    return d3Context.version && d3Context.version.match(v3exp) !== null;
}

},{"./d3v3adaptor":5,"./d3v4adaptor":6}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = require("./layout");
var D3StyleLayoutAdaptor = (function (_super) {
    __extends(D3StyleLayoutAdaptor, _super);
    function D3StyleLayoutAdaptor() {
        var _this = _super.call(this) || this;
        _this.event = d3.dispatch(layout_1.EventType[layout_1.EventType.start], layout_1.EventType[layout_1.EventType.tick], layout_1.EventType[layout_1.EventType.end]);
        var d3layout = _this;
        var drag;
        _this.drag = function () {
            if (!drag) {
                var drag = d3.behavior.drag()
                    .origin(layout_1.Layout.dragOrigin)
                    .on("dragstart.d3adaptor", layout_1.Layout.dragStart)
                    .on("drag.d3adaptor", function (d) {
                    layout_1.Layout.drag(d, d3.event);
                    d3layout.resume();
                })
                    .on("dragend.d3adaptor", layout_1.Layout.dragEnd);
            }
            if (!arguments.length)
                return drag;
            this
                .call(drag);
        };
        return _this;
    }
    D3StyleLayoutAdaptor.prototype.trigger = function (e) {
        var d3event = { type: layout_1.EventType[e.type], alpha: e.alpha, stress: e.stress };
        this.event[d3event.type](d3event);
    };
    D3StyleLayoutAdaptor.prototype.kick = function () {
        var _this = this;
        d3.timer(function () { return _super.prototype.tick.call(_this); });
    };
    D3StyleLayoutAdaptor.prototype.on = function (eventType, listener) {
        if (typeof eventType === 'string') {
            this.event.on(eventType, listener);
        }
        else {
            this.event.on(layout_1.EventType[eventType], listener);
        }
        return this;
    };
    return D3StyleLayoutAdaptor;
}(layout_1.Layout));
exports.D3StyleLayoutAdaptor = D3StyleLayoutAdaptor;
function d3adaptor() {
    return new D3StyleLayoutAdaptor();
}
exports.d3adaptor = d3adaptor;

},{"./layout":11}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = require("./layout");
var D3StyleLayoutAdaptor = (function (_super) {
    __extends(D3StyleLayoutAdaptor, _super);
    function D3StyleLayoutAdaptor(d3Context) {
        var _this = _super.call(this) || this;
        _this.d3Context = d3Context;
        _this.event = d3Context.dispatch(layout_1.EventType[layout_1.EventType.start], layout_1.EventType[layout_1.EventType.tick], layout_1.EventType[layout_1.EventType.end]);
        var d3layout = _this;
        var drag;
        _this.drag = function () {
            if (!drag) {
                var drag = d3Context.drag()
                    .subject(layout_1.Layout.dragOrigin)
                    .on("start.d3adaptor", layout_1.Layout.dragStart)
                    .on("drag.d3adaptor", function (d) {
                    layout_1.Layout.drag(d, d3Context.event);
                    d3layout.resume();
                })
                    .on("end.d3adaptor", layout_1.Layout.dragEnd);
            }
            if (!arguments.length)
                return drag;
            arguments[0].call(drag);
        };
        return _this;
    }
    D3StyleLayoutAdaptor.prototype.trigger = function (e) {
        var d3event = { type: layout_1.EventType[e.type], alpha: e.alpha, stress: e.stress };
        this.event.call(d3event.type, d3event);
    };
    D3StyleLayoutAdaptor.prototype.kick = function () {
        var _this = this;
        var t = this.d3Context.timer(function () { return _super.prototype.tick.call(_this) && t.stop(); });
    };
    D3StyleLayoutAdaptor.prototype.on = function (eventType, listener) {
        if (typeof eventType === 'string') {
            this.event.on(eventType, listener);
        }
        else {
            this.event.on(layout_1.EventType[eventType], listener);
        }
        return this;
    };
    return D3StyleLayoutAdaptor;
}(layout_1.Layout));
exports.D3StyleLayoutAdaptor = D3StyleLayoutAdaptor;

},{"./layout":11}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Locks = (function () {
    function Locks() {
        this.locks = {};
    }
    Locks.prototype.add = function (id, x) {
        this.locks[id] = x;
    };
    Locks.prototype.clear = function () {
        this.locks = {};
    };
    Locks.prototype.isEmpty = function () {
        for (var l in this.locks)
            return false;
        return true;
    };
    Locks.prototype.apply = function (f) {
        for (var l in this.locks) {
            f(Number(l), this.locks[l]);
        }
    };
    return Locks;
}());
exports.Locks = Locks;
var Descent = (function () {
    function Descent(x, D, G) {
        if (G === void 0) { G = null; }
        this.D = D;
        this.G = G;
        this.threshold = 0.0001;
        this.numGridSnapNodes = 0;
        this.snapGridSize = 100;
        this.snapStrength = 1000;
        this.scaleSnapByMaxH = false;
        this.random = new PseudoRandom();
        this.project = null;
        this.x = x;
        this.k = x.length;
        var n = this.n = x[0].length;
        this.H = new Array(this.k);
        this.g = new Array(this.k);
        this.Hd = new Array(this.k);
        this.a = new Array(this.k);
        this.b = new Array(this.k);
        this.c = new Array(this.k);
        this.d = new Array(this.k);
        this.e = new Array(this.k);
        this.ia = new Array(this.k);
        this.ib = new Array(this.k);
        this.xtmp = new Array(this.k);
        this.locks = new Locks();
        this.minD = Number.MAX_VALUE;
        var i = n, j;
        while (i--) {
            j = n;
            while (--j > i) {
                var d = D[i][j];
                if (d > 0 && d < this.minD) {
                    this.minD = d;
                }
            }
        }
        if (this.minD === Number.MAX_VALUE)
            this.minD = 1;
        i = this.k;
        while (i--) {
            this.g[i] = new Array(n);
            this.H[i] = new Array(n);
            j = n;
            while (j--) {
                this.H[i][j] = new Array(n);
            }
            this.Hd[i] = new Array(n);
            this.a[i] = new Array(n);
            this.b[i] = new Array(n);
            this.c[i] = new Array(n);
            this.d[i] = new Array(n);
            this.e[i] = new Array(n);
            this.ia[i] = new Array(n);
            this.ib[i] = new Array(n);
            this.xtmp[i] = new Array(n);
        }
    }
    Descent.createSquareMatrix = function (n, f) {
        var M = new Array(n);
        for (var i = 0; i < n; ++i) {
            M[i] = new Array(n);
            for (var j = 0; j < n; ++j) {
                M[i][j] = f(i, j);
            }
        }
        return M;
    };
    Descent.prototype.offsetDir = function () {
        var _this = this;
        var u = new Array(this.k);
        var l = 0;
        for (var i = 0; i < this.k; ++i) {
            var x = u[i] = this.random.getNextBetween(0.01, 1) - 0.5;
            l += x * x;
        }
        l = Math.sqrt(l);
        return u.map(function (x) { return x *= _this.minD / l; });
    };
    Descent.prototype.computeDerivatives = function (x) {
        var _this = this;
        var n = this.n;
        if (n < 1)
            return;
        var i;
        var d = new Array(this.k);
        var d2 = new Array(this.k);
        var Huu = new Array(this.k);
        var maxH = 0;
        for (var u = 0; u < n; ++u) {
            for (i = 0; i < this.k; ++i)
                Huu[i] = this.g[i][u] = 0;
            for (var v = 0; v < n; ++v) {
                if (u === v)
                    continue;
                var maxDisplaces = n;
                while (maxDisplaces--) {
                    var sd2 = 0;
                    for (i = 0; i < this.k; ++i) {
                        var dx = d[i] = x[i][u] - x[i][v];
                        sd2 += d2[i] = dx * dx;
                    }
                    if (sd2 > 1e-9)
                        break;
                    var rd = this.offsetDir();
                    for (i = 0; i < this.k; ++i)
                        x[i][v] += rd[i];
                }
                var l = Math.sqrt(sd2);
                var D = this.D[u][v];
                var weight = this.G != null ? this.G[u][v] : 1;
                if (weight > 1 && l > D || !isFinite(D)) {
                    for (i = 0; i < this.k; ++i)
                        this.H[i][u][v] = 0;
                    continue;
                }
                if (weight > 1) {
                    weight = 1;
                }
                var D2 = D * D;
                var gs = 2 * weight * (l - D) / (D2 * l);
                var l3 = l * l * l;
                var hs = 2 * -weight / (D2 * l3);
                if (!isFinite(gs))
                    console.log(gs);
                for (i = 0; i < this.k; ++i) {
                    this.g[i][u] += d[i] * gs;
                    Huu[i] -= this.H[i][u][v] = hs * (l3 + D * (d2[i] - sd2) + l * sd2);
                }
            }
            for (i = 0; i < this.k; ++i)
                maxH = Math.max(maxH, this.H[i][u][u] = Huu[i]);
        }
        var r = this.snapGridSize / 2;
        var g = this.snapGridSize;
        var w = this.snapStrength;
        var k = w / (r * r);
        var numNodes = this.numGridSnapNodes;
        for (var u = 0; u < numNodes; ++u) {
            for (i = 0; i < this.k; ++i) {
                var xiu = this.x[i][u];
                var m = xiu / g;
                var f = m % 1;
                var q = m - f;
                var a = Math.abs(f);
                var dx = (a <= 0.5) ? xiu - q * g :
                    (xiu > 0) ? xiu - (q + 1) * g : xiu - (q - 1) * g;
                if (-r < dx && dx <= r) {
                    if (this.scaleSnapByMaxH) {
                        this.g[i][u] += maxH * k * dx;
                        this.H[i][u][u] += maxH * k;
                    }
                    else {
                        this.g[i][u] += k * dx;
                        this.H[i][u][u] += k;
                    }
                }
            }
        }
        if (!this.locks.isEmpty()) {
            this.locks.apply(function (u, p) {
                for (i = 0; i < _this.k; ++i) {
                    _this.H[i][u][u] += maxH;
                    _this.g[i][u] -= maxH * (p[i] - x[i][u]);
                }
            });
        }
    };
    Descent.dotProd = function (a, b) {
        var x = 0, i = a.length;
        while (i--)
            x += a[i] * b[i];
        return x;
    };
    Descent.rightMultiply = function (m, v, r) {
        var i = m.length;
        while (i--)
            r[i] = Descent.dotProd(m[i], v);
    };
    Descent.prototype.computeStepSize = function (d) {
        var numerator = 0, denominator = 0;
        for (var i = 0; i < this.k; ++i) {
            numerator += Descent.dotProd(this.g[i], d[i]);
            Descent.rightMultiply(this.H[i], d[i], this.Hd[i]);
            denominator += Descent.dotProd(d[i], this.Hd[i]);
        }
        if (denominator === 0 || !isFinite(denominator))
            return 0;
        return 1 * numerator / denominator;
    };
    Descent.prototype.reduceStress = function () {
        this.computeDerivatives(this.x);
        var alpha = this.computeStepSize(this.g);
        for (var i = 0; i < this.k; ++i) {
            this.takeDescentStep(this.x[i], this.g[i], alpha);
        }
        return this.computeStress();
    };
    Descent.copy = function (a, b) {
        var m = a.length, n = b[0].length;
        for (var i = 0; i < m; ++i) {
            for (var j = 0; j < n; ++j) {
                b[i][j] = a[i][j];
            }
        }
    };
    Descent.prototype.stepAndProject = function (x0, r, d, stepSize) {
        Descent.copy(x0, r);
        this.takeDescentStep(r[0], d[0], stepSize);
        if (this.project)
            this.project[0](x0[0], x0[1], r[0]);
        this.takeDescentStep(r[1], d[1], stepSize);
        if (this.project)
            this.project[1](r[0], x0[1], r[1]);
        for (var i = 2; i < this.k; i++)
            this.takeDescentStep(r[i], d[i], stepSize);
    };
    Descent.mApply = function (m, n, f) {
        var i = m;
        while (i-- > 0) {
            var j = n;
            while (j-- > 0)
                f(i, j);
        }
    };
    Descent.prototype.matrixApply = function (f) {
        Descent.mApply(this.k, this.n, f);
    };
    Descent.prototype.computeNextPosition = function (x0, r) {
        var _this = this;
        this.computeDerivatives(x0);
        var alpha = this.computeStepSize(this.g);
        this.stepAndProject(x0, r, this.g, alpha);
        if (this.project) {
            this.matrixApply(function (i, j) { return _this.e[i][j] = x0[i][j] - r[i][j]; });
            var beta = this.computeStepSize(this.e);
            beta = Math.max(0.2, Math.min(beta, 1));
            this.stepAndProject(x0, r, this.e, beta);
        }
    };
    Descent.prototype.run = function (iterations) {
        var stress = Number.MAX_VALUE, converged = false;
        while (!converged && iterations-- > 0) {
            var s = this.rungeKutta();
            converged = Math.abs(stress / s - 1) < this.threshold;
            stress = s;
        }
        return stress;
    };
    Descent.prototype.rungeKutta = function () {
        var _this = this;
        this.computeNextPosition(this.x, this.a);
        Descent.mid(this.x, this.a, this.ia);
        this.computeNextPosition(this.ia, this.b);
        Descent.mid(this.x, this.b, this.ib);
        this.computeNextPosition(this.ib, this.c);
        this.computeNextPosition(this.c, this.d);
        var disp = 0;
        this.matrixApply(function (i, j) {
            var x = (_this.a[i][j] + 2.0 * _this.b[i][j] + 2.0 * _this.c[i][j] + _this.d[i][j]) / 6.0, d = _this.x[i][j] - x;
            disp += d * d;
            _this.x[i][j] = x;
        });
        return disp;
    };
    Descent.mid = function (a, b, m) {
        Descent.mApply(a.length, a[0].length, function (i, j) {
            return m[i][j] = a[i][j] + (b[i][j] - a[i][j]) / 2.0;
        });
    };
    Descent.prototype.takeDescentStep = function (x, d, stepSize) {
        for (var i = 0; i < this.n; ++i) {
            x[i] = x[i] - stepSize * d[i];
        }
    };
    Descent.prototype.computeStress = function () {
        var stress = 0;
        for (var u = 0, nMinus1 = this.n - 1; u < nMinus1; ++u) {
            for (var v = u + 1, n = this.n; v < n; ++v) {
                var l = 0;
                for (var i = 0; i < this.k; ++i) {
                    var dx = this.x[i][u] - this.x[i][v];
                    l += dx * dx;
                }
                l = Math.sqrt(l);
                var d = this.D[u][v];
                if (!isFinite(d))
                    continue;
                var rl = d - l;
                var d2 = d * d;
                stress += rl * rl / d2;
            }
        }
        return stress;
    };
    Descent.zeroDistance = 1e-10;
    return Descent;
}());
exports.Descent = Descent;
var PseudoRandom = (function () {
    function PseudoRandom(seed) {
        if (seed === void 0) { seed = 1; }
        this.seed = seed;
        this.a = 214013;
        this.c = 2531011;
        this.m = 2147483648;
        this.range = 32767;
    }
    PseudoRandom.prototype.getNext = function () {
        this.seed = (this.seed * this.a + this.c) % this.m;
        return (this.seed >> 16) / this.range;
    };
    PseudoRandom.prototype.getNextBetween = function (min, max) {
        return min + this.getNext() * (max - min);
    };
    return PseudoRandom;
}());
exports.PseudoRandom = PseudoRandom;

},{}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rectangle_1 = require("./rectangle");
var Point = (function () {
    function Point() {
    }
    return Point;
}());
exports.Point = Point;
var LineSegment = (function () {
    function LineSegment(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    return LineSegment;
}());
exports.LineSegment = LineSegment;
var PolyPoint = (function (_super) {
    __extends(PolyPoint, _super);
    function PolyPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PolyPoint;
}(Point));
exports.PolyPoint = PolyPoint;
function isLeft(P0, P1, P2) {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y);
}
exports.isLeft = isLeft;
function above(p, vi, vj) {
    return isLeft(p, vi, vj) > 0;
}
function below(p, vi, vj) {
    return isLeft(p, vi, vj) < 0;
}
function ConvexHull(S) {
    var P = S.slice(0).sort(function (a, b) { return a.x !== b.x ? b.x - a.x : b.y - a.y; });
    var n = S.length, i;
    var minmin = 0;
    var xmin = P[0].x;
    for (i = 1; i < n; ++i) {
        if (P[i].x !== xmin)
            break;
    }
    var minmax = i - 1;
    var H = [];
    H.push(P[minmin]);
    if (minmax === n - 1) {
        if (P[minmax].y !== P[minmin].y)
            H.push(P[minmax]);
    }
    else {
        var maxmin, maxmax = n - 1;
        var xmax = P[n - 1].x;
        for (i = n - 2; i >= 0; i--)
            if (P[i].x !== xmax)
                break;
        maxmin = i + 1;
        i = minmax;
        while (++i <= maxmin) {
            if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
                continue;
            while (H.length > 1) {
                if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
                    break;
                else
                    H.length -= 1;
            }
            if (i != minmin)
                H.push(P[i]);
        }
        if (maxmax != maxmin)
            H.push(P[maxmax]);
        var bot = H.length;
        i = maxmin;
        while (--i >= minmax) {
            if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
                continue;
            while (H.length > bot) {
                if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
                    break;
                else
                    H.length -= 1;
            }
            if (i != minmin)
                H.push(P[i]);
        }
    }
    return H;
}
exports.ConvexHull = ConvexHull;
function clockwiseRadialSweep(p, P, f) {
    P.slice(0).sort(function (a, b) { return Math.atan2(a.y - p.y, a.x - p.x) - Math.atan2(b.y - p.y, b.x - p.x); }).forEach(f);
}
exports.clockwiseRadialSweep = clockwiseRadialSweep;
function nextPolyPoint(p, ps) {
    if (p.polyIndex === ps.length - 1)
        return ps[0];
    return ps[p.polyIndex + 1];
}
function prevPolyPoint(p, ps) {
    if (p.polyIndex === 0)
        return ps[ps.length - 1];
    return ps[p.polyIndex - 1];
}
function tangent_PointPolyC(P, V) {
    var Vclosed = V.slice(0);
    Vclosed.push(V[0]);
    return { rtan: Rtangent_PointPolyC(P, Vclosed), ltan: Ltangent_PointPolyC(P, Vclosed) };
}
function Rtangent_PointPolyC(P, V) {
    var n = V.length - 1;
    var a, b, c;
    var upA, dnC;
    if (below(P, V[1], V[0]) && !above(P, V[n - 1], V[0]))
        return 0;
    for (a = 0, b = n;;) {
        if (b - a === 1)
            if (above(P, V[a], V[b]))
                return a;
            else
                return b;
        c = Math.floor((a + b) / 2);
        dnC = below(P, V[c + 1], V[c]);
        if (dnC && !above(P, V[c - 1], V[c]))
            return c;
        upA = above(P, V[a + 1], V[a]);
        if (upA) {
            if (dnC)
                b = c;
            else {
                if (above(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
        else {
            if (!dnC)
                a = c;
            else {
                if (below(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
    }
}
function Ltangent_PointPolyC(P, V) {
    var n = V.length - 1;
    var a, b, c;
    var dnA, dnC;
    if (above(P, V[n - 1], V[0]) && !below(P, V[1], V[0]))
        return 0;
    for (a = 0, b = n;;) {
        if (b - a === 1)
            if (below(P, V[a], V[b]))
                return a;
            else
                return b;
        c = Math.floor((a + b) / 2);
        dnC = below(P, V[c + 1], V[c]);
        if (above(P, V[c - 1], V[c]) && !dnC)
            return c;
        dnA = below(P, V[a + 1], V[a]);
        if (dnA) {
            if (!dnC)
                b = c;
            else {
                if (below(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
        else {
            if (dnC)
                a = c;
            else {
                if (above(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
    }
}
function tangent_PolyPolyC(V, W, t1, t2, cmp1, cmp2) {
    var ix1, ix2;
    ix1 = t1(W[0], V);
    ix2 = t2(V[ix1], W);
    var done = false;
    while (!done) {
        done = true;
        while (true) {
            if (ix1 === V.length - 1)
                ix1 = 0;
            if (cmp1(W[ix2], V[ix1], V[ix1 + 1]))
                break;
            ++ix1;
        }
        while (true) {
            if (ix2 === 0)
                ix2 = W.length - 1;
            if (cmp2(V[ix1], W[ix2], W[ix2 - 1]))
                break;
            --ix2;
            done = false;
        }
    }
    return { t1: ix1, t2: ix2 };
}
exports.tangent_PolyPolyC = tangent_PolyPolyC;
function LRtangent_PolyPolyC(V, W) {
    var rl = RLtangent_PolyPolyC(W, V);
    return { t1: rl.t2, t2: rl.t1 };
}
exports.LRtangent_PolyPolyC = LRtangent_PolyPolyC;
function RLtangent_PolyPolyC(V, W) {
    return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Ltangent_PointPolyC, above, below);
}
exports.RLtangent_PolyPolyC = RLtangent_PolyPolyC;
function LLtangent_PolyPolyC(V, W) {
    return tangent_PolyPolyC(V, W, Ltangent_PointPolyC, Ltangent_PointPolyC, below, below);
}
exports.LLtangent_PolyPolyC = LLtangent_PolyPolyC;
function RRtangent_PolyPolyC(V, W) {
    return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Rtangent_PointPolyC, above, above);
}
exports.RRtangent_PolyPolyC = RRtangent_PolyPolyC;
var BiTangent = (function () {
    function BiTangent(t1, t2) {
        this.t1 = t1;
        this.t2 = t2;
    }
    return BiTangent;
}());
exports.BiTangent = BiTangent;
var BiTangents = (function () {
    function BiTangents() {
    }
    return BiTangents;
}());
exports.BiTangents = BiTangents;
var TVGPoint = (function (_super) {
    __extends(TVGPoint, _super);
    function TVGPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TVGPoint;
}(Point));
exports.TVGPoint = TVGPoint;
var VisibilityVertex = (function () {
    function VisibilityVertex(id, polyid, polyvertid, p) {
        this.id = id;
        this.polyid = polyid;
        this.polyvertid = polyvertid;
        this.p = p;
        p.vv = this;
    }
    return VisibilityVertex;
}());
exports.VisibilityVertex = VisibilityVertex;
var VisibilityEdge = (function () {
    function VisibilityEdge(source, target) {
        this.source = source;
        this.target = target;
    }
    VisibilityEdge.prototype.length = function () {
        var dx = this.source.p.x - this.target.p.x;
        var dy = this.source.p.y - this.target.p.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    return VisibilityEdge;
}());
exports.VisibilityEdge = VisibilityEdge;
var TangentVisibilityGraph = (function () {
    function TangentVisibilityGraph(P, g0) {
        this.P = P;
        this.V = [];
        this.E = [];
        if (!g0) {
            var n = P.length;
            for (var i = 0; i < n; i++) {
                var p = P[i];
                for (var j = 0; j < p.length; ++j) {
                    var pj = p[j], vv = new VisibilityVertex(this.V.length, i, j, pj);
                    this.V.push(vv);
                    if (j > 0)
                        this.E.push(new VisibilityEdge(p[j - 1].vv, vv));
                }
                if (p.length > 1)
                    this.E.push(new VisibilityEdge(p[0].vv, p[p.length - 1].vv));
            }
            for (var i = 0; i < n - 1; i++) {
                var Pi = P[i];
                for (var j = i + 1; j < n; j++) {
                    var Pj = P[j], t = tangents(Pi, Pj);
                    for (var q in t) {
                        var c = t[q], source = Pi[c.t1], target = Pj[c.t2];
                        this.addEdgeIfVisible(source, target, i, j);
                    }
                }
            }
        }
        else {
            this.V = g0.V.slice(0);
            this.E = g0.E.slice(0);
        }
    }
    TangentVisibilityGraph.prototype.addEdgeIfVisible = function (u, v, i1, i2) {
        if (!this.intersectsPolys(new LineSegment(u.x, u.y, v.x, v.y), i1, i2)) {
            this.E.push(new VisibilityEdge(u.vv, v.vv));
        }
    };
    TangentVisibilityGraph.prototype.addPoint = function (p, i1) {
        var n = this.P.length;
        this.V.push(new VisibilityVertex(this.V.length, n, 0, p));
        for (var i = 0; i < n; ++i) {
            if (i === i1)
                continue;
            var poly = this.P[i], t = tangent_PointPolyC(p, poly);
            this.addEdgeIfVisible(p, poly[t.ltan], i1, i);
            this.addEdgeIfVisible(p, poly[t.rtan], i1, i);
        }
        return p.vv;
    };
    TangentVisibilityGraph.prototype.intersectsPolys = function (l, i1, i2) {
        for (var i = 0, n = this.P.length; i < n; ++i) {
            if (i != i1 && i != i2 && intersects(l, this.P[i]).length > 0) {
                return true;
            }
        }
        return false;
    };
    return TangentVisibilityGraph;
}());
exports.TangentVisibilityGraph = TangentVisibilityGraph;
function intersects(l, P) {
    var ints = [];
    for (var i = 1, n = P.length; i < n; ++i) {
        var int = rectangle_1.Rectangle.lineIntersection(l.x1, l.y1, l.x2, l.y2, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y);
        if (int)
            ints.push(int);
    }
    return ints;
}
function tangents(V, W) {
    var m = V.length - 1, n = W.length - 1;
    var bt = new BiTangents();
    for (var i = 0; i < m; ++i) {
        for (var j = 0; j < n; ++j) {
            var v1 = V[i == 0 ? m - 1 : i - 1];
            var v2 = V[i];
            var v3 = V[i + 1];
            var w1 = W[j == 0 ? n - 1 : j - 1];
            var w2 = W[j];
            var w3 = W[j + 1];
            var v1v2w2 = isLeft(v1, v2, w2);
            var v2w1w2 = isLeft(v2, w1, w2);
            var v2w2w3 = isLeft(v2, w2, w3);
            var w1w2v2 = isLeft(w1, w2, v2);
            var w2v1v2 = isLeft(w2, v1, v2);
            var w2v2v3 = isLeft(w2, v2, v3);
            if (v1v2w2 >= 0 && v2w1w2 >= 0 && v2w2w3 < 0
                && w1w2v2 >= 0 && w2v1v2 >= 0 && w2v2v3 < 0) {
                bt.ll = new BiTangent(i, j);
            }
            else if (v1v2w2 <= 0 && v2w1w2 <= 0 && v2w2w3 > 0
                && w1w2v2 <= 0 && w2v1v2 <= 0 && w2v2v3 > 0) {
                bt.rr = new BiTangent(i, j);
            }
            else if (v1v2w2 <= 0 && v2w1w2 > 0 && v2w2w3 <= 0
                && w1w2v2 >= 0 && w2v1v2 < 0 && w2v2v3 >= 0) {
                bt.rl = new BiTangent(i, j);
            }
            else if (v1v2w2 >= 0 && v2w1w2 < 0 && v2w2w3 >= 0
                && w1w2v2 <= 0 && w2v1v2 > 0 && w2v2v3 <= 0) {
                bt.lr = new BiTangent(i, j);
            }
        }
    }
    return bt;
}
exports.tangents = tangents;
function isPointInsidePoly(p, poly) {
    for (var i = 1, n = poly.length; i < n; ++i)
        if (below(poly[i - 1], poly[i], p))
            return false;
    return true;
}
function isAnyPInQ(p, q) {
    return !p.every(function (v) { return !isPointInsidePoly(v, q); });
}
function polysOverlap(p, q) {
    if (isAnyPInQ(p, q))
        return true;
    if (isAnyPInQ(q, p))
        return true;
    for (var i = 1, n = p.length; i < n; ++i) {
        var v = p[i], u = p[i - 1];
        if (intersects(new LineSegment(u.x, u.y, v.x, v.y), q).length > 0)
            return true;
    }
    return false;
}
exports.polysOverlap = polysOverlap;

},{"./rectangle":17}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rectangle_1 = require("./rectangle");
var vpsc_1 = require("./vpsc");
var shortestpaths_1 = require("./shortestpaths");
var NodeWrapper = (function () {
    function NodeWrapper(id, rect, children) {
        this.id = id;
        this.rect = rect;
        this.children = children;
        this.leaf = typeof children === 'undefined' || children.length === 0;
    }
    return NodeWrapper;
}());
exports.NodeWrapper = NodeWrapper;
var Vert = (function () {
    function Vert(id, x, y, node, line) {
        if (node === void 0) { node = null; }
        if (line === void 0) { line = null; }
        this.id = id;
        this.x = x;
        this.y = y;
        this.node = node;
        this.line = line;
    }
    return Vert;
}());
exports.Vert = Vert;
var LongestCommonSubsequence = (function () {
    function LongestCommonSubsequence(s, t) {
        this.s = s;
        this.t = t;
        var mf = LongestCommonSubsequence.findMatch(s, t);
        var tr = t.slice(0).reverse();
        var mr = LongestCommonSubsequence.findMatch(s, tr);
        if (mf.length >= mr.length) {
            this.length = mf.length;
            this.si = mf.si;
            this.ti = mf.ti;
            this.reversed = false;
        }
        else {
            this.length = mr.length;
            this.si = mr.si;
            this.ti = t.length - mr.ti - mr.length;
            this.reversed = true;
        }
    }
    LongestCommonSubsequence.findMatch = function (s, t) {
        var m = s.length;
        var n = t.length;
        var match = { length: 0, si: -1, ti: -1 };
        var l = new Array(m);
        for (var i = 0; i < m; i++) {
            l[i] = new Array(n);
            for (var j = 0; j < n; j++)
                if (s[i] === t[j]) {
                    var v = l[i][j] = (i === 0 || j === 0) ? 1 : l[i - 1][j - 1] + 1;
                    if (v > match.length) {
                        match.length = v;
                        match.si = i - v + 1;
                        match.ti = j - v + 1;
                    }
                    ;
                }
                else
                    l[i][j] = 0;
        }
        return match;
    };
    LongestCommonSubsequence.prototype.getSequence = function () {
        return this.length >= 0 ? this.s.slice(this.si, this.si + this.length) : [];
    };
    return LongestCommonSubsequence;
}());
exports.LongestCommonSubsequence = LongestCommonSubsequence;
var GridRouter = (function () {
    function GridRouter(originalnodes, accessor, groupPadding) {
        if (groupPadding === void 0) { groupPadding = 12; }
        var _this = this;
        this.originalnodes = originalnodes;
        this.groupPadding = groupPadding;
        this.leaves = null;
        this.nodes = originalnodes.map(function (v, i) { return new NodeWrapper(i, accessor.getBounds(v), accessor.getChildren(v)); });
        this.leaves = this.nodes.filter(function (v) { return v.leaf; });
        this.groups = this.nodes.filter(function (g) { return !g.leaf; });
        this.cols = this.getGridLines('x');
        this.rows = this.getGridLines('y');
        this.groups.forEach(function (v) {
            return v.children.forEach(function (c) { return _this.nodes[c].parent = v; });
        });
        this.root = { children: [] };
        this.nodes.forEach(function (v) {
            if (typeof v.parent === 'undefined') {
                v.parent = _this.root;
                _this.root.children.push(v.id);
            }
            v.ports = [];
        });
        this.backToFront = this.nodes.slice(0);
        this.backToFront.sort(function (x, y) { return _this.getDepth(x) - _this.getDepth(y); });
        var frontToBackGroups = this.backToFront.slice(0).reverse().filter(function (g) { return !g.leaf; });
        frontToBackGroups.forEach(function (v) {
            var r = rectangle_1.Rectangle.empty();
            v.children.forEach(function (c) { return r = r.union(_this.nodes[c].rect); });
            v.rect = r.inflate(_this.groupPadding);
        });
        var colMids = this.midPoints(this.cols.map(function (r) { return r.pos; }));
        var rowMids = this.midPoints(this.rows.map(function (r) { return r.pos; }));
        var rowx = colMids[0], rowX = colMids[colMids.length - 1];
        var coly = rowMids[0], colY = rowMids[rowMids.length - 1];
        var hlines = this.rows.map(function (r) { return ({ x1: rowx, x2: rowX, y1: r.pos, y2: r.pos }); })
            .concat(rowMids.map(function (m) { return ({ x1: rowx, x2: rowX, y1: m, y2: m }); }));
        var vlines = this.cols.map(function (c) { return ({ x1: c.pos, x2: c.pos, y1: coly, y2: colY }); })
            .concat(colMids.map(function (m) { return ({ x1: m, x2: m, y1: coly, y2: colY }); }));
        var lines = hlines.concat(vlines);
        lines.forEach(function (l) { return l.verts = []; });
        this.verts = [];
        this.edges = [];
        hlines.forEach(function (h) {
            return vlines.forEach(function (v) {
                var p = new Vert(_this.verts.length, v.x1, h.y1);
                h.verts.push(p);
                v.verts.push(p);
                _this.verts.push(p);
                var i = _this.backToFront.length;
                while (i-- > 0) {
                    var node = _this.backToFront[i], r = node.rect;
                    var dx = Math.abs(p.x - r.cx()), dy = Math.abs(p.y - r.cy());
                    if (dx < r.width() / 2 && dy < r.height() / 2) {
                        p.node = node;
                        break;
                    }
                }
            });
        });
        lines.forEach(function (l, li) {
            _this.nodes.forEach(function (v, i) {
                v.rect.lineIntersections(l.x1, l.y1, l.x2, l.y2).forEach(function (intersect, j) {
                    var p = new Vert(_this.verts.length, intersect.x, intersect.y, v, l);
                    _this.verts.push(p);
                    l.verts.push(p);
                    v.ports.push(p);
                });
            });
            var isHoriz = Math.abs(l.y1 - l.y2) < 0.1;
            var delta = function (a, b) { return isHoriz ? b.x - a.x : b.y - a.y; };
            l.verts.sort(delta);
            for (var i = 1; i < l.verts.length; i++) {
                var u = l.verts[i - 1], v = l.verts[i];
                if (u.node && u.node === v.node && u.node.leaf)
                    continue;
                _this.edges.push({ source: u.id, target: v.id, length: Math.abs(delta(u, v)) });
            }
        });
    }
    GridRouter.prototype.avg = function (a) { return a.reduce(function (x, y) { return x + y; }) / a.length; };
    GridRouter.prototype.getGridLines = function (axis) {
        var columns = [];
        var ls = this.leaves.slice(0, this.leaves.length);
        while (ls.length > 0) {
            var overlapping = ls.filter(function (v) { return v.rect['overlap' + axis.toUpperCase()](ls[0].rect); });
            var col = {
                nodes: overlapping,
                pos: this.avg(overlapping.map(function (v) { return v.rect['c' + axis](); }))
            };
            columns.push(col);
            col.nodes.forEach(function (v) { return ls.splice(ls.indexOf(v), 1); });
        }
        columns.sort(function (a, b) { return a.pos - b.pos; });
        return columns;
    };
    GridRouter.prototype.getDepth = function (v) {
        var depth = 0;
        while (v.parent !== this.root) {
            depth++;
            v = v.parent;
        }
        return depth;
    };
    GridRouter.prototype.midPoints = function (a) {
        var gap = a[1] - a[0];
        var mids = [a[0] - gap / 2];
        for (var i = 1; i < a.length; i++) {
            mids.push((a[i] + a[i - 1]) / 2);
        }
        mids.push(a[a.length - 1] + gap / 2);
        return mids;
    };
    GridRouter.prototype.findLineage = function (v) {
        var lineage = [v];
        do {
            v = v.parent;
            lineage.push(v);
        } while (v !== this.root);
        return lineage.reverse();
    };
    GridRouter.prototype.findAncestorPathBetween = function (a, b) {
        var aa = this.findLineage(a), ba = this.findLineage(b), i = 0;
        while (aa[i] === ba[i])
            i++;
        return { commonAncestor: aa[i - 1], lineages: aa.slice(i).concat(ba.slice(i)) };
    };
    GridRouter.prototype.siblingObstacles = function (a, b) {
        var _this = this;
        var path = this.findAncestorPathBetween(a, b);
        var lineageLookup = {};
        path.lineages.forEach(function (v) { return lineageLookup[v.id] = {}; });
        var obstacles = path.commonAncestor.children.filter(function (v) { return !(v in lineageLookup); });
        path.lineages
            .filter(function (v) { return v.parent !== path.commonAncestor; })
            .forEach(function (v) { return obstacles = obstacles.concat(v.parent.children.filter(function (c) { return c !== v.id; })); });
        return obstacles.map(function (v) { return _this.nodes[v]; });
    };
    GridRouter.getSegmentSets = function (routes, x, y) {
        var vsegments = [];
        for (var ei = 0; ei < routes.length; ei++) {
            var route = routes[ei];
            for (var si = 0; si < route.length; si++) {
                var s = route[si];
                s.edgeid = ei;
                s.i = si;
                var sdx = s[1][x] - s[0][x];
                if (Math.abs(sdx) < 0.1) {
                    vsegments.push(s);
                }
            }
        }
        vsegments.sort(function (a, b) { return a[0][x] - b[0][x]; });
        var vsegmentsets = [];
        var segmentset = null;
        for (var i = 0; i < vsegments.length; i++) {
            var s = vsegments[i];
            if (!segmentset || Math.abs(s[0][x] - segmentset.pos) > 0.1) {
                segmentset = { pos: s[0][x], segments: [] };
                vsegmentsets.push(segmentset);
            }
            segmentset.segments.push(s);
        }
        return vsegmentsets;
    };
    GridRouter.nudgeSegs = function (x, y, routes, segments, leftOf, gap) {
        var n = segments.length;
        if (n <= 1)
            return;
        var vs = segments.map(function (s) { return new vpsc_1.Variable(s[0][x]); });
        var cs = [];
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (i === j)
                    continue;
                var s1 = segments[i], s2 = segments[j], e1 = s1.edgeid, e2 = s2.edgeid, lind = -1, rind = -1;
                if (x == 'x') {
                    if (leftOf(e1, e2)) {
                        if (s1[0][y] < s1[1][y]) {
                            lind = j, rind = i;
                        }
                        else {
                            lind = i, rind = j;
                        }
                    }
                }
                else {
                    if (leftOf(e1, e2)) {
                        if (s1[0][y] < s1[1][y]) {
                            lind = i, rind = j;
                        }
                        else {
                            lind = j, rind = i;
                        }
                    }
                }
                if (lind >= 0) {
                    cs.push(new vpsc_1.Constraint(vs[lind], vs[rind], gap));
                }
            }
        }
        var solver = new vpsc_1.Solver(vs, cs);
        solver.solve();
        vs.forEach(function (v, i) {
            var s = segments[i];
            var pos = v.position();
            s[0][x] = s[1][x] = pos;
            var route = routes[s.edgeid];
            if (s.i > 0)
                route[s.i - 1][1][x] = pos;
            if (s.i < route.length - 1)
                route[s.i + 1][0][x] = pos;
        });
    };
    GridRouter.nudgeSegments = function (routes, x, y, leftOf, gap) {
        var vsegmentsets = GridRouter.getSegmentSets(routes, x, y);
        for (var i = 0; i < vsegmentsets.length; i++) {
            var ss = vsegmentsets[i];
            var events = [];
            for (var j = 0; j < ss.segments.length; j++) {
                var s = ss.segments[j];
                events.push({ type: 0, s: s, pos: Math.min(s[0][y], s[1][y]) });
                events.push({ type: 1, s: s, pos: Math.max(s[0][y], s[1][y]) });
            }
            events.sort(function (a, b) { return a.pos - b.pos + a.type - b.type; });
            var open = [];
            var openCount = 0;
            events.forEach(function (e) {
                if (e.type === 0) {
                    open.push(e.s);
                    openCount++;
                }
                else {
                    openCount--;
                }
                if (openCount == 0) {
                    GridRouter.nudgeSegs(x, y, routes, open, leftOf, gap);
                    open = [];
                }
            });
        }
    };
    GridRouter.prototype.routeEdges = function (edges, nudgeGap, source, target) {
        var _this = this;
        var routePaths = edges.map(function (e) { return _this.route(source(e), target(e)); });
        var order = GridRouter.orderEdges(routePaths);
        var routes = routePaths.map(function (e) { return GridRouter.makeSegments(e); });
        GridRouter.nudgeSegments(routes, 'x', 'y', order, nudgeGap);
        GridRouter.nudgeSegments(routes, 'y', 'x', order, nudgeGap);
        GridRouter.unreverseEdges(routes, routePaths);
        return routes;
    };
    GridRouter.unreverseEdges = function (routes, routePaths) {
        routes.forEach(function (segments, i) {
            var path = routePaths[i];
            if (path.reversed) {
                segments.reverse();
                segments.forEach(function (segment) {
                    segment.reverse();
                });
            }
        });
    };
    GridRouter.angleBetween2Lines = function (line1, line2) {
        var angle1 = Math.atan2(line1[0].y - line1[1].y, line1[0].x - line1[1].x);
        var angle2 = Math.atan2(line2[0].y - line2[1].y, line2[0].x - line2[1].x);
        var diff = angle1 - angle2;
        if (diff > Math.PI || diff < -Math.PI) {
            diff = angle2 - angle1;
        }
        return diff;
    };
    GridRouter.isLeft = function (a, b, c) {
        return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) <= 0;
    };
    GridRouter.getOrder = function (pairs) {
        var outgoing = {};
        for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i];
            if (typeof outgoing[p.l] === 'undefined')
                outgoing[p.l] = {};
            outgoing[p.l][p.r] = true;
        }
        return function (l, r) { return typeof outgoing[l] !== 'undefined' && outgoing[l][r]; };
    };
    GridRouter.orderEdges = function (edges) {
        var edgeOrder = [];
        for (var i = 0; i < edges.length - 1; i++) {
            for (var j = i + 1; j < edges.length; j++) {
                var e = edges[i], f = edges[j], lcs = new LongestCommonSubsequence(e, f);
                var u, vi, vj;
                if (lcs.length === 0)
                    continue;
                if (lcs.reversed) {
                    f.reverse();
                    f.reversed = true;
                    lcs = new LongestCommonSubsequence(e, f);
                }
                if ((lcs.si <= 0 || lcs.ti <= 0) &&
                    (lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length)) {
                    edgeOrder.push({ l: i, r: j });
                    continue;
                }
                if (lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length) {
                    u = e[lcs.si + 1];
                    vj = e[lcs.si - 1];
                    vi = f[lcs.ti - 1];
                }
                else {
                    u = e[lcs.si + lcs.length - 2];
                    vi = e[lcs.si + lcs.length];
                    vj = f[lcs.ti + lcs.length];
                }
                if (GridRouter.isLeft(u, vi, vj)) {
                    edgeOrder.push({ l: j, r: i });
                }
                else {
                    edgeOrder.push({ l: i, r: j });
                }
            }
        }
        return GridRouter.getOrder(edgeOrder);
    };
    GridRouter.makeSegments = function (path) {
        function copyPoint(p) {
            return { x: p.x, y: p.y };
        }
        var isStraight = function (a, b, c) { return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0.001; };
        var segments = [];
        var a = copyPoint(path[0]);
        for (var i = 1; i < path.length; i++) {
            var b = copyPoint(path[i]), c = i < path.length - 1 ? path[i + 1] : null;
            if (!c || !isStraight(a, b, c)) {
                segments.push([a, b]);
                a = b;
            }
        }
        return segments;
    };
    GridRouter.prototype.route = function (s, t) {
        var _this = this;
        var source = this.nodes[s], target = this.nodes[t];
        this.obstacles = this.siblingObstacles(source, target);
        var obstacleLookup = {};
        this.obstacles.forEach(function (o) { return obstacleLookup[o.id] = o; });
        this.passableEdges = this.edges.filter(function (e) {
            var u = _this.verts[e.source], v = _this.verts[e.target];
            return !(u.node && u.node.id in obstacleLookup
                || v.node && v.node.id in obstacleLookup);
        });
        for (var i = 1; i < source.ports.length; i++) {
            var u = source.ports[0].id;
            var v = source.ports[i].id;
            this.passableEdges.push({
                source: u,
                target: v,
                length: 0
            });
        }
        for (var i = 1; i < target.ports.length; i++) {
            var u = target.ports[0].id;
            var v = target.ports[i].id;
            this.passableEdges.push({
                source: u,
                target: v,
                length: 0
            });
        }
        var getSource = function (e) { return e.source; }, getTarget = function (e) { return e.target; }, getLength = function (e) { return e.length; };
        var shortestPathCalculator = new shortestpaths_1.Calculator(this.verts.length, this.passableEdges, getSource, getTarget, getLength);
        var bendPenalty = function (u, v, w) {
            var a = _this.verts[u], b = _this.verts[v], c = _this.verts[w];
            var dx = Math.abs(c.x - a.x), dy = Math.abs(c.y - a.y);
            if (a.node === source && a.node === b.node || b.node === target && b.node === c.node)
                return 0;
            return dx > 1 && dy > 1 ? 1000 : 0;
        };
        var shortestPath = shortestPathCalculator.PathFromNodeToNodeWithPrevCost(source.ports[0].id, target.ports[0].id, bendPenalty);
        var pathPoints = shortestPath.reverse().map(function (vi) { return _this.verts[vi]; });
        pathPoints.push(this.nodes[target.id].ports[0]);
        return pathPoints.filter(function (v, i) {
            return !(i < pathPoints.length - 1 && pathPoints[i + 1].node === source && v.node === source
                || i > 0 && v.node === target && pathPoints[i - 1].node === target);
        });
    };
    GridRouter.getRoutePath = function (route, cornerradius, arrowwidth, arrowheight) {
        var result = {
            routepath: 'M ' + route[0][0].x + ' ' + route[0][0].y + ' ',
            arrowpath: ''
        };
        if (route.length > 1) {
            for (var i = 0; i < route.length; i++) {
                var li = route[i];
                var x = li[1].x, y = li[1].y;
                var dx = x - li[0].x;
                var dy = y - li[0].y;
                if (i < route.length - 1) {
                    if (Math.abs(dx) > 0) {
                        x -= dx / Math.abs(dx) * cornerradius;
                    }
                    else {
                        y -= dy / Math.abs(dy) * cornerradius;
                    }
                    result.routepath += 'L ' + x + ' ' + y + ' ';
                    var l = route[i + 1];
                    var x0 = l[0].x, y0 = l[0].y;
                    var x1 = l[1].x;
                    var y1 = l[1].y;
                    dx = x1 - x0;
                    dy = y1 - y0;
                    var angle = GridRouter.angleBetween2Lines(li, l) < 0 ? 1 : 0;
                    var x2, y2;
                    if (Math.abs(dx) > 0) {
                        x2 = x0 + dx / Math.abs(dx) * cornerradius;
                        y2 = y0;
                    }
                    else {
                        x2 = x0;
                        y2 = y0 + dy / Math.abs(dy) * cornerradius;
                    }
                    var cx = Math.abs(x2 - x);
                    var cy = Math.abs(y2 - y);
                    result.routepath += 'A ' + cx + ' ' + cy + ' 0 0 ' + angle + ' ' + x2 + ' ' + y2 + ' ';
                }
                else {
                    var arrowtip = [x, y];
                    var arrowcorner1, arrowcorner2;
                    if (Math.abs(dx) > 0) {
                        x -= dx / Math.abs(dx) * arrowheight;
                        arrowcorner1 = [x, y + arrowwidth];
                        arrowcorner2 = [x, y - arrowwidth];
                    }
                    else {
                        y -= dy / Math.abs(dy) * arrowheight;
                        arrowcorner1 = [x + arrowwidth, y];
                        arrowcorner2 = [x - arrowwidth, y];
                    }
                    result.routepath += 'L ' + x + ' ' + y + ' ';
                    if (arrowheight > 0) {
                        result.arrowpath = 'M ' + arrowtip[0] + ' ' + arrowtip[1] + ' L ' + arrowcorner1[0] + ' ' + arrowcorner1[1]
                            + ' L ' + arrowcorner2[0] + ' ' + arrowcorner2[1];
                    }
                }
            }
        }
        else {
            var li = route[0];
            var x = li[1].x, y = li[1].y;
            var dx = x - li[0].x;
            var dy = y - li[0].y;
            var arrowtip = [x, y];
            var arrowcorner1, arrowcorner2;
            if (Math.abs(dx) > 0) {
                x -= dx / Math.abs(dx) * arrowheight;
                arrowcorner1 = [x, y + arrowwidth];
                arrowcorner2 = [x, y - arrowwidth];
            }
            else {
                y -= dy / Math.abs(dy) * arrowheight;
                arrowcorner1 = [x + arrowwidth, y];
                arrowcorner2 = [x - arrowwidth, y];
            }
            result.routepath += 'L ' + x + ' ' + y + ' ';
            if (arrowheight > 0) {
                result.arrowpath = 'M ' + arrowtip[0] + ' ' + arrowtip[1] + ' L ' + arrowcorner1[0] + ' ' + arrowcorner1[1]
                    + ' L ' + arrowcorner2[0] + ' ' + arrowcorner2[1];
            }
        }
        return result;
    };
    return GridRouter;
}());
exports.GridRouter = GridRouter;

},{"./rectangle":17,"./shortestpaths":18,"./vpsc":19}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var packingOptions = {
    PADDING: 10,
    GOLDEN_SECTION: (1 + Math.sqrt(5)) / 2,
    FLOAT_EPSILON: 0.0001,
    MAX_INERATIONS: 100
};
function applyPacking(graphs, w, h, node_size, desired_ratio) {
    if (desired_ratio === void 0) { desired_ratio = 1; }
    var init_x = 0, init_y = 0, svg_width = w, svg_height = h, desired_ratio = typeof desired_ratio !== 'undefined' ? desired_ratio : 1, node_size = typeof node_size !== 'undefined' ? node_size : 0, real_width = 0, real_height = 0, min_width = 0, global_bottom = 0, line = [];
    if (graphs.length == 0)
        return;
    calculate_bb(graphs);
    apply(graphs, desired_ratio);
    put_nodes_to_right_positions(graphs);
    function calculate_bb(graphs) {
        graphs.forEach(function (g) {
            calculate_single_bb(g);
        });
        function calculate_single_bb(graph) {
            var min_x = Number.MAX_VALUE, min_y = Number.MAX_VALUE, max_x = 0, max_y = 0;
            graph.array.forEach(function (v) {
                var w = typeof v.width !== 'undefined' ? v.width : node_size;
                var h = typeof v.height !== 'undefined' ? v.height : node_size;
                w /= 2;
                h /= 2;
                max_x = Math.max(v.x + w, max_x);
                min_x = Math.min(v.x - w, min_x);
                max_y = Math.max(v.y + h, max_y);
                min_y = Math.min(v.y - h, min_y);
            });
            graph.width = max_x - min_x;
            graph.height = max_y - min_y;
        }
    }
    function put_nodes_to_right_positions(graphs) {
        graphs.forEach(function (g) {
            var center = { x: 0, y: 0 };
            g.array.forEach(function (node) {
                center.x += node.x;
                center.y += node.y;
            });
            center.x /= g.array.length;
            center.y /= g.array.length;
            var corner = { x: center.x - g.width / 2, y: center.y - g.height / 2 };
            var offset = { x: g.x - corner.x + svg_width / 2 - real_width / 2, y: g.y - corner.y + svg_height / 2 - real_height / 2 };
            g.array.forEach(function (node) {
                node.x += offset.x;
                node.y += offset.y;
            });
        });
    }
    function apply(data, desired_ratio) {
        var curr_best_f = Number.POSITIVE_INFINITY;
        var curr_best = 0;
        data.sort(function (a, b) { return b.height - a.height; });
        min_width = data.reduce(function (a, b) {
            return a.width < b.width ? a.width : b.width;
        });
        var left = x1 = min_width;
        var right = x2 = get_entire_width(data);
        var iterationCounter = 0;
        var f_x1 = Number.MAX_VALUE;
        var f_x2 = Number.MAX_VALUE;
        var flag = -1;
        var dx = Number.MAX_VALUE;
        var df = Number.MAX_VALUE;
        while ((dx > min_width) || df > packingOptions.FLOAT_EPSILON) {
            if (flag != 1) {
                var x1 = right - (right - left) / packingOptions.GOLDEN_SECTION;
                var f_x1 = step(data, x1);
            }
            if (flag != 0) {
                var x2 = left + (right - left) / packingOptions.GOLDEN_SECTION;
                var f_x2 = step(data, x2);
            }
            dx = Math.abs(x1 - x2);
            df = Math.abs(f_x1 - f_x2);
            if (f_x1 < curr_best_f) {
                curr_best_f = f_x1;
                curr_best = x1;
            }
            if (f_x2 < curr_best_f) {
                curr_best_f = f_x2;
                curr_best = x2;
            }
            if (f_x1 > f_x2) {
                left = x1;
                x1 = x2;
                f_x1 = f_x2;
                flag = 1;
            }
            else {
                right = x2;
                x2 = x1;
                f_x2 = f_x1;
                flag = 0;
            }
            if (iterationCounter++ > 100) {
                break;
            }
        }
        step(data, curr_best);
    }
    function step(data, max_width) {
        line = [];
        real_width = 0;
        real_height = 0;
        global_bottom = init_y;
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            put_rect(o, max_width);
        }
        return Math.abs(get_real_ratio() - desired_ratio);
    }
    function put_rect(rect, max_width) {
        var parent = undefined;
        for (var i = 0; i < line.length; i++) {
            if ((line[i].space_left >= rect.height) && (line[i].x + line[i].width + rect.width + packingOptions.PADDING - max_width) <= packingOptions.FLOAT_EPSILON) {
                parent = line[i];
                break;
            }
        }
        line.push(rect);
        if (parent !== undefined) {
            rect.x = parent.x + parent.width + packingOptions.PADDING;
            rect.y = parent.bottom;
            rect.space_left = rect.height;
            rect.bottom = rect.y;
            parent.space_left -= rect.height + packingOptions.PADDING;
            parent.bottom += rect.height + packingOptions.PADDING;
        }
        else {
            rect.y = global_bottom;
            global_bottom += rect.height + packingOptions.PADDING;
            rect.x = init_x;
            rect.bottom = rect.y;
            rect.space_left = rect.height;
        }
        if (rect.y + rect.height - real_height > -packingOptions.FLOAT_EPSILON)
            real_height = rect.y + rect.height - init_y;
        if (rect.x + rect.width - real_width > -packingOptions.FLOAT_EPSILON)
            real_width = rect.x + rect.width - init_x;
    }
    ;
    function get_entire_width(data) {
        var width = 0;
        data.forEach(function (d) { return width += d.width + packingOptions.PADDING; });
        return width;
    }
    function get_real_ratio() {
        return (real_width / real_height);
    }
}
exports.applyPacking = applyPacking;
function separateGraphs(nodes, links) {
    var marks = {};
    var ways = {};
    var graphs = [];
    var clusters = 0;
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var n1 = link.source;
        var n2 = link.target;
        if (ways[n1.index])
            ways[n1.index].push(n2);
        else
            ways[n1.index] = [n2];
        if (ways[n2.index])
            ways[n2.index].push(n1);
        else
            ways[n2.index] = [n1];
    }
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (marks[node.index])
            continue;
        explore_node(node, true);
    }
    function explore_node(n, is_new) {
        if (marks[n.index] !== undefined)
            return;
        if (is_new) {
            clusters++;
            graphs.push({ array: [] });
        }
        marks[n.index] = clusters;
        graphs[clusters - 1].array.push(n);
        var adjacent = ways[n.index];
        if (!adjacent)
            return;
        for (var j = 0; j < adjacent.length; j++) {
            explore_node(adjacent[j], false);
        }
    }
    return graphs;
}
exports.separateGraphs = separateGraphs;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var powergraph = require("./powergraph");
var linklengths_1 = require("./linklengths");
var descent_1 = require("./descent");
var rectangle_1 = require("./rectangle");
var shortestpaths_1 = require("./shortestpaths");
var geom_1 = require("./geom");
var handledisconnected_1 = require("./handledisconnected");
var EventType;
(function (EventType) {
    EventType[EventType["start"] = 0] = "start";
    EventType[EventType["tick"] = 1] = "tick";
    EventType[EventType["end"] = 2] = "end";
})(EventType = exports.EventType || (exports.EventType = {}));
;
function isGroup(g) {
    return typeof g.leaves !== 'undefined' || typeof g.groups !== 'undefined';
}
var Layout = (function () {
    function Layout() {
        var _this = this;
        this._canvasSize = [1, 1];
        this._linkDistance = 20;
        this._defaultNodeSize = 10;
        this._linkLengthCalculator = null;
        this._linkType = null;
        this._avoidOverlaps = false;
        this._handleDisconnected = true;
        this._running = false;
        this._nodes = [];
        this._groups = [];
        this._rootGroup = null;
        this._links = [];
        this._constraints = [];
        this._distanceMatrix = null;
        this._descent = null;
        this._directedLinkConstraints = null;
        this._threshold = 0.01;
        this._visibilityGraph = null;
        this._groupCompactness = 1e-6;
        this.event = null;
        this.linkAccessor = {
            getSourceIndex: Layout.getSourceIndex,
            getTargetIndex: Layout.getTargetIndex,
            setLength: Layout.setLinkLength,
            getType: function (l) { return typeof _this._linkType === "function" ? _this._linkType(l) : 0; }
        };
    }
    Layout.prototype.on = function (e, listener) {
        if (!this.event)
            this.event = {};
        if (typeof e === 'string') {
            this.event[EventType[e]] = listener;
        }
        else {
            this.event[e] = listener;
        }
        return this;
    };
    Layout.prototype.trigger = function (e) {
        if (this.event && typeof this.event[e.type] !== 'undefined') {
            this.event[e.type](e);
        }
    };
    Layout.prototype.kick = function () {
        while (!this.tick())
            ;
    };
    Layout.prototype.tick = function () {
        if (this._alpha < this._threshold) {
            this._running = false;
            this.trigger({ type: EventType.end, alpha: this._alpha = 0, stress: this._lastStress });
            return true;
        }
        var n = this._nodes.length, m = this._links.length;
        var o, i;
        this._descent.locks.clear();
        for (i = 0; i < n; ++i) {
            o = this._nodes[i];
            if (o.fixed) {
                if (typeof o.px === 'undefined' || typeof o.py === 'undefined') {
                    o.px = o.x;
                    o.py = o.y;
                }
                var p = [o.px, o.py];
                this._descent.locks.add(i, p);
            }
        }
        var s1 = this._descent.rungeKutta();
        if (s1 === 0) {
            this._alpha = 0;
        }
        else if (typeof this._lastStress !== 'undefined') {
            this._alpha = s1;
        }
        this._lastStress = s1;
        this.updateNodePositions();
        this.trigger({ type: EventType.tick, alpha: this._alpha, stress: this._lastStress });
        return false;
    };
    Layout.prototype.updateNodePositions = function () {
        var x = this._descent.x[0], y = this._descent.x[1];
        var o, i = this._nodes.length;
        while (i--) {
            o = this._nodes[i];
            o.x = x[i];
            o.y = y[i];
        }
    };
    Layout.prototype.nodes = function (v) {
        if (!v) {
            if (this._nodes.length === 0 && this._links.length > 0) {
                var n = 0;
                this._links.forEach(function (l) {
                    n = Math.max(n, l.source, l.target);
                });
                this._nodes = new Array(++n);
                for (var i = 0; i < n; ++i) {
                    this._nodes[i] = {};
                }
            }
            return this._nodes;
        }
        this._nodes = v;
        return this;
    };
    Layout.prototype.groups = function (x) {
        var _this = this;
        if (!x)
            return this._groups;
        this._groups = x;
        this._rootGroup = {};
        this._groups.forEach(function (g) {
            if (typeof g.padding === "undefined")
                g.padding = 1;
            if (typeof g.leaves !== "undefined") {
                g.leaves.forEach(function (v, i) {
                    if (typeof v === 'number')
                        (g.leaves[i] = _this._nodes[v]).parent = g;
                });
            }
            if (typeof g.groups !== "undefined") {
                g.groups.forEach(function (gi, i) {
                    if (typeof gi === 'number')
                        (g.groups[i] = _this._groups[gi]).parent = g;
                });
            }
        });
        this._rootGroup.leaves = this._nodes.filter(function (v) { return typeof v.parent === 'undefined'; });
        this._rootGroup.groups = this._groups.filter(function (g) { return typeof g.parent === 'undefined'; });
        return this;
    };
    Layout.prototype.powerGraphGroups = function (f) {
        var g = powergraph.getGroups(this._nodes, this._links, this.linkAccessor, this._rootGroup);
        this.groups(g.groups);
        f(g);
        return this;
    };
    Layout.prototype.avoidOverlaps = function (v) {
        if (!arguments.length)
            return this._avoidOverlaps;
        this._avoidOverlaps = v;
        return this;
    };
    Layout.prototype.handleDisconnected = function (v) {
        if (!arguments.length)
            return this._handleDisconnected;
        this._handleDisconnected = v;
        return this;
    };
    Layout.prototype.flowLayout = function (axis, minSeparation) {
        if (!arguments.length)
            axis = 'y';
        this._directedLinkConstraints = {
            axis: axis,
            getMinSeparation: typeof minSeparation === 'number' ? function () { return minSeparation; } : minSeparation
        };
        return this;
    };
    Layout.prototype.links = function (x) {
        if (!arguments.length)
            return this._links;
        this._links = x;
        return this;
    };
    Layout.prototype.constraints = function (c) {
        if (!arguments.length)
            return this._constraints;
        this._constraints = c;
        return this;
    };
    Layout.prototype.distanceMatrix = function (d) {
        if (!arguments.length)
            return this._distanceMatrix;
        this._distanceMatrix = d;
        return this;
    };
    Layout.prototype.size = function (x) {
        if (!x)
            return this._canvasSize;
        this._canvasSize = x;
        return this;
    };
    Layout.prototype.defaultNodeSize = function (x) {
        if (!x)
            return this._defaultNodeSize;
        this._defaultNodeSize = x;
        return this;
    };
    Layout.prototype.groupCompactness = function (x) {
        if (!x)
            return this._groupCompactness;
        this._groupCompactness = x;
        return this;
    };
    Layout.prototype.linkDistance = function (x) {
        if (!x) {
            return this._linkDistance;
        }
        this._linkDistance = typeof x === "function" ? x : +x;
        this._linkLengthCalculator = null;
        return this;
    };
    Layout.prototype.linkType = function (f) {
        this._linkType = f;
        return this;
    };
    Layout.prototype.convergenceThreshold = function (x) {
        if (!x)
            return this._threshold;
        this._threshold = typeof x === "function" ? x : +x;
        return this;
    };
    Layout.prototype.alpha = function (x) {
        if (!arguments.length)
            return this._alpha;
        else {
            x = +x;
            if (this._alpha) {
                if (x > 0)
                    this._alpha = x;
                else
                    this._alpha = 0;
            }
            else if (x > 0) {
                if (!this._running) {
                    this._running = true;
                    this.trigger({ type: EventType.start, alpha: this._alpha = x });
                    this.kick();
                }
            }
            return this;
        }
    };
    Layout.prototype.getLinkLength = function (link) {
        return typeof this._linkDistance === "function" ? +(this._linkDistance(link)) : this._linkDistance;
    };
    Layout.setLinkLength = function (link, length) {
        link.length = length;
    };
    Layout.prototype.getLinkType = function (link) {
        return typeof this._linkType === "function" ? this._linkType(link) : 0;
    };
    Layout.prototype.symmetricDiffLinkLengths = function (idealLength, w) {
        var _this = this;
        if (w === void 0) { w = 1; }
        this.linkDistance(function (l) { return idealLength * l.length; });
        this._linkLengthCalculator = function () { return linklengths_1.symmetricDiffLinkLengths(_this._links, _this.linkAccessor, w); };
        return this;
    };
    Layout.prototype.jaccardLinkLengths = function (idealLength, w) {
        var _this = this;
        if (w === void 0) { w = 1; }
        this.linkDistance(function (l) { return idealLength * l.length; });
        this._linkLengthCalculator = function () { return linklengths_1.jaccardLinkLengths(_this._links, _this.linkAccessor, w); };
        return this;
    };
    Layout.prototype.start = function (initialUnconstrainedIterations, initialUserConstraintIterations, initialAllConstraintsIterations, gridSnapIterations, keepRunning) {
        var _this = this;
        if (initialUnconstrainedIterations === void 0) { initialUnconstrainedIterations = 0; }
        if (initialUserConstraintIterations === void 0) { initialUserConstraintIterations = 0; }
        if (initialAllConstraintsIterations === void 0) { initialAllConstraintsIterations = 0; }
        if (gridSnapIterations === void 0) { gridSnapIterations = 0; }
        if (keepRunning === void 0) { keepRunning = true; }
        var i, j, n = this.nodes().length, N = n + 2 * this._groups.length, m = this._links.length, w = this._canvasSize[0], h = this._canvasSize[1];
        var x = new Array(N), y = new Array(N);
        var G = null;
        var ao = this._avoidOverlaps;
        this._nodes.forEach(function (v, i) {
            v.index = i;
            if (typeof v.x === 'undefined') {
                v.x = w / 2, v.y = h / 2;
            }
            x[i] = v.x, y[i] = v.y;
        });
        if (this._linkLengthCalculator)
            this._linkLengthCalculator();
        var distances;
        if (this._distanceMatrix) {
            distances = this._distanceMatrix;
        }
        else {
            distances = (new shortestpaths_1.Calculator(N, this._links, Layout.getSourceIndex, Layout.getTargetIndex, function (l) { return _this.getLinkLength(l); })).DistanceMatrix();
            G = descent_1.Descent.createSquareMatrix(N, function () { return 2; });
            this._links.forEach(function (l) {
                if (typeof l.source == "number")
                    l.source = _this._nodes[l.source];
                if (typeof l.target == "number")
                    l.target = _this._nodes[l.target];
            });
            this._links.forEach(function (e) {
                var u = Layout.getSourceIndex(e), v = Layout.getTargetIndex(e);
                G[u][v] = G[v][u] = e.weight || 1;
            });
        }
        var D = descent_1.Descent.createSquareMatrix(N, function (i, j) {
            return distances[i][j];
        });
        if (this._rootGroup && typeof this._rootGroup.groups !== 'undefined') {
            var i = n;
            var addAttraction = function (i, j, strength, idealDistance) {
                G[i][j] = G[j][i] = strength;
                D[i][j] = D[j][i] = idealDistance;
            };
            this._groups.forEach(function (g) {
                addAttraction(i, i + 1, _this._groupCompactness, 0.1);
                x[i] = 0, y[i++] = 0;
                x[i] = 0, y[i++] = 0;
            });
        }
        else
            this._rootGroup = { leaves: this._nodes, groups: [] };
        var curConstraints = this._constraints || [];
        if (this._directedLinkConstraints) {
            this.linkAccessor.getMinSeparation = this._directedLinkConstraints.getMinSeparation;
            curConstraints = curConstraints.concat(linklengths_1.generateDirectedEdgeConstraints(n, this._links, this._directedLinkConstraints.axis, (this.linkAccessor)));
        }
        this.avoidOverlaps(false);
        this._descent = new descent_1.Descent([x, y], D);
        this._descent.locks.clear();
        for (var i = 0; i < n; ++i) {
            var o = this._nodes[i];
            if (o.fixed) {
                o.px = o.x;
                o.py = o.y;
                var p = [o.x, o.y];
                this._descent.locks.add(i, p);
            }
        }
        this._descent.threshold = this._threshold;
        this.initialLayout(initialUnconstrainedIterations, x, y);
        if (curConstraints.length > 0)
            this._descent.project = new rectangle_1.Projection(this._nodes, this._groups, this._rootGroup, curConstraints).projectFunctions();
        this._descent.run(initialUserConstraintIterations);
        this.separateOverlappingComponents(w, h);
        this.avoidOverlaps(ao);
        if (ao) {
            this._nodes.forEach(function (v, i) { v.x = x[i], v.y = y[i]; });
            this._descent.project = new rectangle_1.Projection(this._nodes, this._groups, this._rootGroup, curConstraints, true).projectFunctions();
            this._nodes.forEach(function (v, i) { x[i] = v.x, y[i] = v.y; });
        }
        this._descent.G = G;
        this._descent.run(initialAllConstraintsIterations);
        if (gridSnapIterations) {
            this._descent.snapStrength = 1000;
            this._descent.snapGridSize = this._nodes[0].width;
            this._descent.numGridSnapNodes = n;
            this._descent.scaleSnapByMaxH = n != N;
            var G0 = descent_1.Descent.createSquareMatrix(N, function (i, j) {
                if (i >= n || j >= n)
                    return G[i][j];
                return 0;
            });
            this._descent.G = G0;
            this._descent.run(gridSnapIterations);
        }
        this.updateNodePositions();
        this.separateOverlappingComponents(w, h);
        return keepRunning ? this.resume() : this;
    };
    Layout.prototype.initialLayout = function (iterations, x, y) {
        if (this._groups.length > 0 && iterations > 0) {
            var n = this._nodes.length;
            var edges = this._links.map(function (e) { return ({ source: e.source.index, target: e.target.index }); });
            var vs = this._nodes.map(function (v) { return ({ index: v.index }); });
            this._groups.forEach(function (g, i) {
                vs.push({ index: g.index = n + i });
            });
            this._groups.forEach(function (g, i) {
                if (typeof g.leaves !== 'undefined')
                    g.leaves.forEach(function (v) { return edges.push({ source: g.index, target: v.index }); });
                if (typeof g.groups !== 'undefined')
                    g.groups.forEach(function (gg) { return edges.push({ source: g.index, target: gg.index }); });
            });
            new Layout()
                .size(this.size())
                .nodes(vs)
                .links(edges)
                .avoidOverlaps(false)
                .linkDistance(this.linkDistance())
                .symmetricDiffLinkLengths(5)
                .convergenceThreshold(1e-4)
                .start(iterations, 0, 0, 0, false);
            this._nodes.forEach(function (v) {
                x[v.index] = vs[v.index].x;
                y[v.index] = vs[v.index].y;
            });
        }
        else {
            this._descent.run(iterations);
        }
    };
    Layout.prototype.separateOverlappingComponents = function (width, height) {
        var _this = this;
        if (!this._distanceMatrix && this._handleDisconnected) {
            var x_1 = this._descent.x[0], y_1 = this._descent.x[1];
            this._nodes.forEach(function (v, i) { v.x = x_1[i], v.y = y_1[i]; });
            var graphs = handledisconnected_1.separateGraphs(this._nodes, this._links);
            handledisconnected_1.applyPacking(graphs, width, height, this._defaultNodeSize);
            this._nodes.forEach(function (v, i) {
                _this._descent.x[0][i] = v.x, _this._descent.x[1][i] = v.y;
                if (v.bounds) {
                    v.bounds.setXCentre(v.x);
                    v.bounds.setYCentre(v.y);
                }
            });
        }
    };
    Layout.prototype.resume = function () {
        return this.alpha(0.1);
    };
    Layout.prototype.stop = function () {
        return this.alpha(0);
    };
    Layout.prototype.prepareEdgeRouting = function (nodeMargin) {
        if (nodeMargin === void 0) { nodeMargin = 0; }
        this._visibilityGraph = new geom_1.TangentVisibilityGraph(this._nodes.map(function (v) {
            return v.bounds.inflate(-nodeMargin).vertices();
        }));
    };
    Layout.prototype.routeEdge = function (edge, ah, draw) {
        if (ah === void 0) { ah = 5; }
        var lineData = [];
        var vg2 = new geom_1.TangentVisibilityGraph(this._visibilityGraph.P, { V: this._visibilityGraph.V, E: this._visibilityGraph.E }), port1 = { x: edge.source.x, y: edge.source.y }, port2 = { x: edge.target.x, y: edge.target.y }, start = vg2.addPoint(port1, edge.source.index), end = vg2.addPoint(port2, edge.target.index);
        vg2.addEdgeIfVisible(port1, port2, edge.source.index, edge.target.index);
        if (typeof draw !== 'undefined') {
            draw(vg2);
        }
        var sourceInd = function (e) { return e.source.id; }, targetInd = function (e) { return e.target.id; }, length = function (e) { return e.length(); }, spCalc = new shortestpaths_1.Calculator(vg2.V.length, vg2.E, sourceInd, targetInd, length), shortestPath = spCalc.PathFromNodeToNode(start.id, end.id);
        if (shortestPath.length === 1 || shortestPath.length === vg2.V.length) {
            var route = rectangle_1.makeEdgeBetween(edge.source.innerBounds, edge.target.innerBounds, ah);
            lineData = [route.sourceIntersection, route.arrowStart];
        }
        else {
            var n = shortestPath.length - 2, p = vg2.V[shortestPath[n]].p, q = vg2.V[shortestPath[0]].p, lineData = [edge.source.innerBounds.rayIntersection(p.x, p.y)];
            for (var i = n; i >= 0; --i)
                lineData.push(vg2.V[shortestPath[i]].p);
            lineData.push(rectangle_1.makeEdgeTo(q, edge.target.innerBounds, ah));
        }
        return lineData;
    };
    Layout.getSourceIndex = function (e) {
        return typeof e.source === 'number' ? e.source : e.source.index;
    };
    Layout.getTargetIndex = function (e) {
        return typeof e.target === 'number' ? e.target : e.target.index;
    };
    Layout.linkId = function (e) {
        return Layout.getSourceIndex(e) + "-" + Layout.getTargetIndex(e);
    };
    Layout.dragStart = function (d) {
        if (isGroup(d)) {
            Layout.storeOffset(d, Layout.dragOrigin(d));
        }
        else {
            Layout.stopNode(d);
            d.fixed |= 2;
        }
    };
    Layout.stopNode = function (v) {
        v.px = v.x;
        v.py = v.y;
    };
    Layout.storeOffset = function (d, origin) {
        if (typeof d.leaves !== 'undefined') {
            d.leaves.forEach(function (v) {
                v.fixed |= 2;
                Layout.stopNode(v);
                v._dragGroupOffsetX = v.x - origin.x;
                v._dragGroupOffsetY = v.y - origin.y;
            });
        }
        if (typeof d.groups !== 'undefined') {
            d.groups.forEach(function (g) { return Layout.storeOffset(g, origin); });
        }
    };
    Layout.dragOrigin = function (d) {
        if (isGroup(d)) {
            return {
                x: d.bounds.cx(),
                y: d.bounds.cy()
            };
        }
        else {
            return d;
        }
    };
    Layout.drag = function (d, position) {
        if (isGroup(d)) {
            if (typeof d.leaves !== 'undefined') {
                d.leaves.forEach(function (v) {
                    d.bounds.setXCentre(position.x);
                    d.bounds.setYCentre(position.y);
                    v.px = v._dragGroupOffsetX + position.x;
                    v.py = v._dragGroupOffsetY + position.y;
                });
            }
            if (typeof d.groups !== 'undefined') {
                d.groups.forEach(function (g) { return Layout.drag(g, position); });
            }
        }
        else {
            d.px = position.x;
            d.py = position.y;
        }
    };
    Layout.dragEnd = function (d) {
        if (isGroup(d)) {
            if (typeof d.leaves !== 'undefined') {
                d.leaves.forEach(function (v) {
                    Layout.dragEnd(v);
                    delete v._dragGroupOffsetX;
                    delete v._dragGroupOffsetY;
                });
            }
            if (typeof d.groups !== 'undefined') {
                d.groups.forEach(Layout.dragEnd);
            }
        }
        else {
            d.fixed &= ~6;
        }
    };
    Layout.mouseOver = function (d) {
        d.fixed |= 4;
        d.px = d.x, d.py = d.y;
    };
    Layout.mouseOut = function (d) {
        d.fixed &= ~4;
    };
    return Layout;
}());
exports.Layout = Layout;

},{"./descent":7,"./geom":8,"./handledisconnected":10,"./linklengths":13,"./powergraph":14,"./rectangle":17,"./shortestpaths":18}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shortestpaths_1 = require("./shortestpaths");
var descent_1 = require("./descent");
var rectangle_1 = require("./rectangle");
var linklengths_1 = require("./linklengths");
var Link3D = (function () {
    function Link3D(source, target) {
        this.source = source;
        this.target = target;
    }
    Link3D.prototype.actualLength = function (x) {
        var _this = this;
        return Math.sqrt(x.reduce(function (c, v) {
            var dx = v[_this.target] - v[_this.source];
            return c + dx * dx;
        }, 0));
    };
    return Link3D;
}());
exports.Link3D = Link3D;
var Node3D = (function () {
    function Node3D(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Node3D;
}());
exports.Node3D = Node3D;
var Layout3D = (function () {
    function Layout3D(nodes, links, idealLinkLength) {
        if (idealLinkLength === void 0) { idealLinkLength = 1; }
        var _this = this;
        this.nodes = nodes;
        this.links = links;
        this.idealLinkLength = idealLinkLength;
        this.constraints = null;
        this.useJaccardLinkLengths = true;
        this.result = new Array(Layout3D.k);
        for (var i = 0; i < Layout3D.k; ++i) {
            this.result[i] = new Array(nodes.length);
        }
        nodes.forEach(function (v, i) {
            for (var _i = 0, _a = Layout3D.dims; _i < _a.length; _i++) {
                var dim = _a[_i];
                if (typeof v[dim] == 'undefined')
                    v[dim] = Math.random();
            }
            _this.result[0][i] = v.x;
            _this.result[1][i] = v.y;
            _this.result[2][i] = v.z;
        });
    }
    ;
    Layout3D.prototype.linkLength = function (l) {
        return l.actualLength(this.result);
    };
    Layout3D.prototype.start = function (iterations) {
        var _this = this;
        if (iterations === void 0) { iterations = 100; }
        var n = this.nodes.length;
        var linkAccessor = new LinkAccessor();
        if (this.useJaccardLinkLengths)
            linklengths_1.jaccardLinkLengths(this.links, linkAccessor, 1.5);
        this.links.forEach(function (e) { return e.length *= _this.idealLinkLength; });
        var distanceMatrix = (new shortestpaths_1.Calculator(n, this.links, function (e) { return e.source; }, function (e) { return e.target; }, function (e) { return e.length; })).DistanceMatrix();
        var D = descent_1.Descent.createSquareMatrix(n, function (i, j) { return distanceMatrix[i][j]; });
        var G = descent_1.Descent.createSquareMatrix(n, function () { return 2; });
        this.links.forEach(function (_a) {
            var source = _a.source, target = _a.target;
            return G[source][target] = G[target][source] = 1;
        });
        this.descent = new descent_1.Descent(this.result, D);
        this.descent.threshold = 1e-3;
        this.descent.G = G;
        if (this.constraints)
            this.descent.project = new rectangle_1.Projection(this.nodes, null, null, this.constraints).projectFunctions();
        for (var i = 0; i < this.nodes.length; i++) {
            var v = this.nodes[i];
            if (v.fixed) {
                this.descent.locks.add(i, [v.x, v.y, v.z]);
            }
        }
        this.descent.run(iterations);
        return this;
    };
    Layout3D.prototype.tick = function () {
        this.descent.locks.clear();
        for (var i = 0; i < this.nodes.length; i++) {
            var v = this.nodes[i];
            if (v.fixed) {
                this.descent.locks.add(i, [v.x, v.y, v.z]);
            }
        }
        return this.descent.rungeKutta();
    };
    Layout3D.dims = ['x', 'y', 'z'];
    Layout3D.k = Layout3D.dims.length;
    return Layout3D;
}());
exports.Layout3D = Layout3D;
var LinkAccessor = (function () {
    function LinkAccessor() {
    }
    LinkAccessor.prototype.getSourceIndex = function (e) { return e.source; };
    LinkAccessor.prototype.getTargetIndex = function (e) { return e.target; };
    LinkAccessor.prototype.getLength = function (e) { return e.length; };
    LinkAccessor.prototype.setLength = function (e, l) { e.length = l; };
    return LinkAccessor;
}());

},{"./descent":7,"./linklengths":13,"./rectangle":17,"./shortestpaths":18}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unionCount(a, b) {
    var u = {};
    for (var i in a)
        u[i] = {};
    for (var i in b)
        u[i] = {};
    return Object.keys(u).length;
}
function intersectionCount(a, b) {
    var n = 0;
    for (var i in a)
        if (typeof b[i] !== 'undefined')
            ++n;
    return n;
}
function getNeighbours(links, la) {
    var neighbours = {};
    var addNeighbours = function (u, v) {
        if (typeof neighbours[u] === 'undefined')
            neighbours[u] = {};
        neighbours[u][v] = {};
    };
    links.forEach(function (e) {
        var u = la.getSourceIndex(e), v = la.getTargetIndex(e);
        addNeighbours(u, v);
        addNeighbours(v, u);
    });
    return neighbours;
}
function computeLinkLengths(links, w, f, la) {
    var neighbours = getNeighbours(links, la);
    links.forEach(function (l) {
        var a = neighbours[la.getSourceIndex(l)];
        var b = neighbours[la.getTargetIndex(l)];
        la.setLength(l, 1 + w * f(a, b));
    });
}
function symmetricDiffLinkLengths(links, la, w) {
    if (w === void 0) { w = 1; }
    computeLinkLengths(links, w, function (a, b) { return Math.sqrt(unionCount(a, b) - intersectionCount(a, b)); }, la);
}
exports.symmetricDiffLinkLengths = symmetricDiffLinkLengths;
function jaccardLinkLengths(links, la, w) {
    if (w === void 0) { w = 1; }
    computeLinkLengths(links, w, function (a, b) {
        return Math.min(Object.keys(a).length, Object.keys(b).length) < 1.1 ? 0 : intersectionCount(a, b) / unionCount(a, b);
    }, la);
}
exports.jaccardLinkLengths = jaccardLinkLengths;
function generateDirectedEdgeConstraints(n, links, axis, la) {
    var components = stronglyConnectedComponents(n, links, la);
    var nodes = {};
    components.forEach(function (c, i) {
        return c.forEach(function (v) { return nodes[v] = i; });
    });
    var constraints = [];
    links.forEach(function (l) {
        var ui = la.getSourceIndex(l), vi = la.getTargetIndex(l), u = nodes[ui], v = nodes[vi];
        if (u !== v) {
            constraints.push({
                axis: axis,
                left: ui,
                right: vi,
                gap: la.getMinSeparation(l)
            });
        }
    });
    return constraints;
}
exports.generateDirectedEdgeConstraints = generateDirectedEdgeConstraints;
function stronglyConnectedComponents(numVertices, edges, la) {
    var nodes = [];
    var index = 0;
    var stack = [];
    var components = [];
    function strongConnect(v) {
        v.index = v.lowlink = index++;
        stack.push(v);
        v.onStack = true;
        for (var _i = 0, _a = v.out; _i < _a.length; _i++) {
            var w = _a[_i];
            if (typeof w.index === 'undefined') {
                strongConnect(w);
                v.lowlink = Math.min(v.lowlink, w.lowlink);
            }
            else if (w.onStack) {
                v.lowlink = Math.min(v.lowlink, w.index);
            }
        }
        if (v.lowlink === v.index) {
            var component = [];
            while (stack.length) {
                w = stack.pop();
                w.onStack = false;
                component.push(w);
                if (w === v)
                    break;
            }
            components.push(component.map(function (v) { return v.id; }));
        }
    }
    for (var i = 0; i < numVertices; i++) {
        nodes.push({ id: i, out: [] });
    }
    for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
        var e = edges_1[_i];
        var v_1 = nodes[la.getSourceIndex(e)], w = nodes[la.getTargetIndex(e)];
        v_1.out.push(w);
    }
    for (var _a = 0, nodes_1 = nodes; _a < nodes_1.length; _a++) {
        var v = nodes_1[_a];
        if (typeof v.index === 'undefined')
            strongConnect(v);
    }
    return components;
}
exports.stronglyConnectedComponents = stronglyConnectedComponents;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PowerEdge = (function () {
    function PowerEdge(source, target, type) {
        this.source = source;
        this.target = target;
        this.type = type;
    }
    return PowerEdge;
}());
exports.PowerEdge = PowerEdge;
var Configuration = (function () {
    function Configuration(n, edges, linkAccessor, rootGroup) {
        var _this = this;
        this.linkAccessor = linkAccessor;
        this.modules = new Array(n);
        this.roots = [];
        if (rootGroup) {
            this.initModulesFromGroup(rootGroup);
        }
        else {
            this.roots.push(new ModuleSet());
            for (var i = 0; i < n; ++i)
                this.roots[0].add(this.modules[i] = new Module(i));
        }
        this.R = edges.length;
        edges.forEach(function (e) {
            var s = _this.modules[linkAccessor.getSourceIndex(e)], t = _this.modules[linkAccessor.getTargetIndex(e)], type = linkAccessor.getType(e);
            s.outgoing.add(type, t);
            t.incoming.add(type, s);
        });
    }
    Configuration.prototype.initModulesFromGroup = function (group) {
        var moduleSet = new ModuleSet();
        this.roots.push(moduleSet);
        for (var i = 0; i < group.leaves.length; ++i) {
            var node = group.leaves[i];
            var module = new Module(node.id);
            this.modules[node.id] = module;
            moduleSet.add(module);
        }
        if (group.groups) {
            for (var j = 0; j < group.groups.length; ++j) {
                var child = group.groups[j];
                var definition = {};
                for (var prop in child)
                    if (prop !== "leaves" && prop !== "groups" && child.hasOwnProperty(prop))
                        definition[prop] = child[prop];
                moduleSet.add(new Module(-1 - j, new LinkSets(), new LinkSets(), this.initModulesFromGroup(child), definition));
            }
        }
        return moduleSet;
    };
    Configuration.prototype.merge = function (a, b, k) {
        if (k === void 0) { k = 0; }
        var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
        var children = new ModuleSet();
        children.add(a);
        children.add(b);
        var m = new Module(this.modules.length, outInt, inInt, children);
        this.modules.push(m);
        var update = function (s, i, o) {
            s.forAll(function (ms, linktype) {
                ms.forAll(function (n) {
                    var nls = n[i];
                    nls.add(linktype, m);
                    nls.remove(linktype, a);
                    nls.remove(linktype, b);
                    a[o].remove(linktype, n);
                    b[o].remove(linktype, n);
                });
            });
        };
        update(outInt, "incoming", "outgoing");
        update(inInt, "outgoing", "incoming");
        this.R -= inInt.count() + outInt.count();
        this.roots[k].remove(a);
        this.roots[k].remove(b);
        this.roots[k].add(m);
        return m;
    };
    Configuration.prototype.rootMerges = function (k) {
        if (k === void 0) { k = 0; }
        var rs = this.roots[k].modules();
        var n = rs.length;
        var merges = new Array(n * (n - 1));
        var ctr = 0;
        for (var i = 0, i_ = n - 1; i < i_; ++i) {
            for (var j = i + 1; j < n; ++j) {
                var a = rs[i], b = rs[j];
                merges[ctr] = { id: ctr, nEdges: this.nEdges(a, b), a: a, b: b };
                ctr++;
            }
        }
        return merges;
    };
    Configuration.prototype.greedyMerge = function () {
        for (var i = 0; i < this.roots.length; ++i) {
            if (this.roots[i].modules().length < 2)
                continue;
            var ms = this.rootMerges(i).sort(function (a, b) { return a.nEdges == b.nEdges ? a.id - b.id : a.nEdges - b.nEdges; });
            var m = ms[0];
            if (m.nEdges >= this.R)
                continue;
            this.merge(m.a, m.b, i);
            return true;
        }
    };
    Configuration.prototype.nEdges = function (a, b) {
        var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
        return this.R - inInt.count() - outInt.count();
    };
    Configuration.prototype.getGroupHierarchy = function (retargetedEdges) {
        var _this = this;
        var groups = [];
        var root = {};
        toGroups(this.roots[0], root, groups);
        var es = this.allEdges();
        es.forEach(function (e) {
            var a = _this.modules[e.source];
            var b = _this.modules[e.target];
            retargetedEdges.push(new PowerEdge(typeof a.gid === "undefined" ? e.source : groups[a.gid], typeof b.gid === "undefined" ? e.target : groups[b.gid], e.type));
        });
        return groups;
    };
    Configuration.prototype.allEdges = function () {
        var es = [];
        Configuration.getEdges(this.roots[0], es);
        return es;
    };
    Configuration.getEdges = function (modules, es) {
        modules.forAll(function (m) {
            m.getEdges(es);
            Configuration.getEdges(m.children, es);
        });
    };
    return Configuration;
}());
exports.Configuration = Configuration;
function toGroups(modules, group, groups) {
    modules.forAll(function (m) {
        if (m.isLeaf()) {
            if (!group.leaves)
                group.leaves = [];
            group.leaves.push(m.id);
        }
        else {
            var g = group;
            m.gid = groups.length;
            if (!m.isIsland() || m.isPredefined()) {
                g = { id: m.gid };
                if (m.isPredefined())
                    for (var prop in m.definition)
                        g[prop] = m.definition[prop];
                if (!group.groups)
                    group.groups = [];
                group.groups.push(m.gid);
                groups.push(g);
            }
            toGroups(m.children, g, groups);
        }
    });
}
var Module = (function () {
    function Module(id, outgoing, incoming, children, definition) {
        if (outgoing === void 0) { outgoing = new LinkSets(); }
        if (incoming === void 0) { incoming = new LinkSets(); }
        if (children === void 0) { children = new ModuleSet(); }
        this.id = id;
        this.outgoing = outgoing;
        this.incoming = incoming;
        this.children = children;
        this.definition = definition;
    }
    Module.prototype.getEdges = function (es) {
        var _this = this;
        this.outgoing.forAll(function (ms, edgetype) {
            ms.forAll(function (target) {
                es.push(new PowerEdge(_this.id, target.id, edgetype));
            });
        });
    };
    Module.prototype.isLeaf = function () {
        return this.children.count() === 0;
    };
    Module.prototype.isIsland = function () {
        return this.outgoing.count() === 0 && this.incoming.count() === 0;
    };
    Module.prototype.isPredefined = function () {
        return typeof this.definition !== "undefined";
    };
    return Module;
}());
exports.Module = Module;
function intersection(m, n) {
    var i = {};
    for (var v in m)
        if (v in n)
            i[v] = m[v];
    return i;
}
var ModuleSet = (function () {
    function ModuleSet() {
        this.table = {};
    }
    ModuleSet.prototype.count = function () {
        return Object.keys(this.table).length;
    };
    ModuleSet.prototype.intersection = function (other) {
        var result = new ModuleSet();
        result.table = intersection(this.table, other.table);
        return result;
    };
    ModuleSet.prototype.intersectionCount = function (other) {
        return this.intersection(other).count();
    };
    ModuleSet.prototype.contains = function (id) {
        return id in this.table;
    };
    ModuleSet.prototype.add = function (m) {
        this.table[m.id] = m;
    };
    ModuleSet.prototype.remove = function (m) {
        delete this.table[m.id];
    };
    ModuleSet.prototype.forAll = function (f) {
        for (var mid in this.table) {
            f(this.table[mid]);
        }
    };
    ModuleSet.prototype.modules = function () {
        var vs = [];
        this.forAll(function (m) {
            if (!m.isPredefined())
                vs.push(m);
        });
        return vs;
    };
    return ModuleSet;
}());
exports.ModuleSet = ModuleSet;
var LinkSets = (function () {
    function LinkSets() {
        this.sets = {};
        this.n = 0;
    }
    LinkSets.prototype.count = function () {
        return this.n;
    };
    LinkSets.prototype.contains = function (id) {
        var result = false;
        this.forAllModules(function (m) {
            if (!result && m.id == id) {
                result = true;
            }
        });
        return result;
    };
    LinkSets.prototype.add = function (linktype, m) {
        var s = linktype in this.sets ? this.sets[linktype] : this.sets[linktype] = new ModuleSet();
        s.add(m);
        ++this.n;
    };
    LinkSets.prototype.remove = function (linktype, m) {
        var ms = this.sets[linktype];
        ms.remove(m);
        if (ms.count() === 0) {
            delete this.sets[linktype];
        }
        --this.n;
    };
    LinkSets.prototype.forAll = function (f) {
        for (var linktype in this.sets) {
            f(this.sets[linktype], Number(linktype));
        }
    };
    LinkSets.prototype.forAllModules = function (f) {
        this.forAll(function (ms, lt) { return ms.forAll(f); });
    };
    LinkSets.prototype.intersection = function (other) {
        var result = new LinkSets();
        this.forAll(function (ms, lt) {
            if (lt in other.sets) {
                var i = ms.intersection(other.sets[lt]), n = i.count();
                if (n > 0) {
                    result.sets[lt] = i;
                    result.n += n;
                }
            }
        });
        return result;
    };
    return LinkSets;
}());
exports.LinkSets = LinkSets;
function intersectionCount(m, n) {
    return Object.keys(intersection(m, n)).length;
}
function getGroups(nodes, links, la, rootGroup) {
    var n = nodes.length, c = new Configuration(n, links, la, rootGroup);
    while (c.greedyMerge())
        ;
    var powerEdges = [];
    var g = c.getGroupHierarchy(powerEdges);
    powerEdges.forEach(function (e) {
        var f = function (end) {
            var g = e[end];
            if (typeof g == "number")
                e[end] = nodes[g];
        };
        f("source");
        f("target");
    });
    return { groups: g, powerEdges: powerEdges };
}
exports.getGroups = getGroups;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PairingHeap = (function () {
    function PairingHeap(elem) {
        this.elem = elem;
        this.subheaps = [];
    }
    PairingHeap.prototype.toString = function (selector) {
        var str = "", needComma = false;
        for (var i = 0; i < this.subheaps.length; ++i) {
            var subheap = this.subheaps[i];
            if (!subheap.elem) {
                needComma = false;
                continue;
            }
            if (needComma) {
                str = str + ",";
            }
            str = str + subheap.toString(selector);
            needComma = true;
        }
        if (str !== "") {
            str = "(" + str + ")";
        }
        return (this.elem ? selector(this.elem) : "") + str;
    };
    PairingHeap.prototype.forEach = function (f) {
        if (!this.empty()) {
            f(this.elem, this);
            this.subheaps.forEach(function (s) { return s.forEach(f); });
        }
    };
    PairingHeap.prototype.count = function () {
        return this.empty() ? 0 : 1 + this.subheaps.reduce(function (n, h) {
            return n + h.count();
        }, 0);
    };
    PairingHeap.prototype.min = function () {
        return this.elem;
    };
    PairingHeap.prototype.empty = function () {
        return this.elem == null;
    };
    PairingHeap.prototype.contains = function (h) {
        if (this === h)
            return true;
        for (var i = 0; i < this.subheaps.length; i++) {
            if (this.subheaps[i].contains(h))
                return true;
        }
        return false;
    };
    PairingHeap.prototype.isHeap = function (lessThan) {
        var _this = this;
        return this.subheaps.every(function (h) { return lessThan(_this.elem, h.elem) && h.isHeap(lessThan); });
    };
    PairingHeap.prototype.insert = function (obj, lessThan) {
        return this.merge(new PairingHeap(obj), lessThan);
    };
    PairingHeap.prototype.merge = function (heap2, lessThan) {
        if (this.empty())
            return heap2;
        else if (heap2.empty())
            return this;
        else if (lessThan(this.elem, heap2.elem)) {
            this.subheaps.push(heap2);
            return this;
        }
        else {
            heap2.subheaps.push(this);
            return heap2;
        }
    };
    PairingHeap.prototype.removeMin = function (lessThan) {
        if (this.empty())
            return null;
        else
            return this.mergePairs(lessThan);
    };
    PairingHeap.prototype.mergePairs = function (lessThan) {
        if (this.subheaps.length == 0)
            return new PairingHeap(null);
        else if (this.subheaps.length == 1) {
            return this.subheaps[0];
        }
        else {
            var firstPair = this.subheaps.pop().merge(this.subheaps.pop(), lessThan);
            var remaining = this.mergePairs(lessThan);
            return firstPair.merge(remaining, lessThan);
        }
    };
    PairingHeap.prototype.decreaseKey = function (subheap, newValue, setHeapNode, lessThan) {
        var newHeap = subheap.removeMin(lessThan);
        subheap.elem = newHeap.elem;
        subheap.subheaps = newHeap.subheaps;
        if (setHeapNode !== null && newHeap.elem !== null) {
            setHeapNode(subheap.elem, subheap);
        }
        var pairingNode = new PairingHeap(newValue);
        if (setHeapNode !== null) {
            setHeapNode(newValue, pairingNode);
        }
        return this.merge(pairingNode, lessThan);
    };
    return PairingHeap;
}());
exports.PairingHeap = PairingHeap;
var PriorityQueue = (function () {
    function PriorityQueue(lessThan) {
        this.lessThan = lessThan;
    }
    PriorityQueue.prototype.top = function () {
        if (this.empty()) {
            return null;
        }
        return this.root.elem;
    };
    PriorityQueue.prototype.push = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var pairingNode;
        for (var i = 0, arg; arg = args[i]; ++i) {
            pairingNode = new PairingHeap(arg);
            this.root = this.empty() ?
                pairingNode : this.root.merge(pairingNode, this.lessThan);
        }
        return pairingNode;
    };
    PriorityQueue.prototype.empty = function () {
        return !this.root || !this.root.elem;
    };
    PriorityQueue.prototype.isHeap = function () {
        return this.root.isHeap(this.lessThan);
    };
    PriorityQueue.prototype.forEach = function (f) {
        this.root.forEach(f);
    };
    PriorityQueue.prototype.pop = function () {
        if (this.empty()) {
            return null;
        }
        var obj = this.root.min();
        this.root = this.root.removeMin(this.lessThan);
        return obj;
    };
    PriorityQueue.prototype.reduceKey = function (heapNode, newKey, setHeapNode) {
        if (setHeapNode === void 0) { setHeapNode = null; }
        this.root = this.root.decreaseKey(heapNode, newKey, setHeapNode, this.lessThan);
    };
    PriorityQueue.prototype.toString = function (selector) {
        return this.root.toString(selector);
    };
    PriorityQueue.prototype.count = function () {
        return this.root.count();
    };
    return PriorityQueue;
}());
exports.PriorityQueue = PriorityQueue;

},{}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TreeBase = (function () {
    function TreeBase() {
        this.findIter = function (data) {
            var res = this._root;
            var iter = this.iterator();
            while (res !== null) {
                var c = this._comparator(data, res.data);
                if (c === 0) {
                    iter._cursor = res;
                    return iter;
                }
                else {
                    iter._ancestors.push(res);
                    res = res.get_child(c > 0);
                }
            }
            return null;
        };
    }
    TreeBase.prototype.clear = function () {
        this._root = null;
        this.size = 0;
    };
    ;
    TreeBase.prototype.find = function (data) {
        var res = this._root;
        while (res !== null) {
            var c = this._comparator(data, res.data);
            if (c === 0) {
                return res.data;
            }
            else {
                res = res.get_child(c > 0);
            }
        }
        return null;
    };
    ;
    TreeBase.prototype.lowerBound = function (data) {
        return this._bound(data, this._comparator);
    };
    ;
    TreeBase.prototype.upperBound = function (data) {
        var cmp = this._comparator;
        function reverse_cmp(a, b) {
            return cmp(b, a);
        }
        return this._bound(data, reverse_cmp);
    };
    ;
    TreeBase.prototype.min = function () {
        var res = this._root;
        if (res === null) {
            return null;
        }
        while (res.left !== null) {
            res = res.left;
        }
        return res.data;
    };
    ;
    TreeBase.prototype.max = function () {
        var res = this._root;
        if (res === null) {
            return null;
        }
        while (res.right !== null) {
            res = res.right;
        }
        return res.data;
    };
    ;
    TreeBase.prototype.iterator = function () {
        return new Iterator(this);
    };
    ;
    TreeBase.prototype.each = function (cb) {
        var it = this.iterator(), data;
        while ((data = it.next()) !== null) {
            cb(data);
        }
    };
    ;
    TreeBase.prototype.reach = function (cb) {
        var it = this.iterator(), data;
        while ((data = it.prev()) !== null) {
            cb(data);
        }
    };
    ;
    TreeBase.prototype._bound = function (data, cmp) {
        var cur = this._root;
        var iter = this.iterator();
        while (cur !== null) {
            var c = this._comparator(data, cur.data);
            if (c === 0) {
                iter._cursor = cur;
                return iter;
            }
            iter._ancestors.push(cur);
            cur = cur.get_child(c > 0);
        }
        for (var i = iter._ancestors.length - 1; i >= 0; --i) {
            cur = iter._ancestors[i];
            if (cmp(data, cur.data) > 0) {
                iter._cursor = cur;
                iter._ancestors.length = i;
                return iter;
            }
        }
        iter._ancestors.length = 0;
        return iter;
    };
    ;
    return TreeBase;
}());
exports.TreeBase = TreeBase;
var Iterator = (function () {
    function Iterator(tree) {
        this._tree = tree;
        this._ancestors = [];
        this._cursor = null;
    }
    Iterator.prototype.data = function () {
        return this._cursor !== null ? this._cursor.data : null;
    };
    ;
    Iterator.prototype.next = function () {
        if (this._cursor === null) {
            var root = this._tree._root;
            if (root !== null) {
                this._minNode(root);
            }
        }
        else {
            if (this._cursor.right === null) {
                var save;
                do {
                    save = this._cursor;
                    if (this._ancestors.length) {
                        this._cursor = this._ancestors.pop();
                    }
                    else {
                        this._cursor = null;
                        break;
                    }
                } while (this._cursor.right === save);
            }
            else {
                this._ancestors.push(this._cursor);
                this._minNode(this._cursor.right);
            }
        }
        return this._cursor !== null ? this._cursor.data : null;
    };
    ;
    Iterator.prototype.prev = function () {
        if (this._cursor === null) {
            var root = this._tree._root;
            if (root !== null) {
                this._maxNode(root);
            }
        }
        else {
            if (this._cursor.left === null) {
                var save;
                do {
                    save = this._cursor;
                    if (this._ancestors.length) {
                        this._cursor = this._ancestors.pop();
                    }
                    else {
                        this._cursor = null;
                        break;
                    }
                } while (this._cursor.left === save);
            }
            else {
                this._ancestors.push(this._cursor);
                this._maxNode(this._cursor.left);
            }
        }
        return this._cursor !== null ? this._cursor.data : null;
    };
    ;
    Iterator.prototype._minNode = function (start) {
        while (start.left !== null) {
            this._ancestors.push(start);
            start = start.left;
        }
        this._cursor = start;
    };
    ;
    Iterator.prototype._maxNode = function (start) {
        while (start.right !== null) {
            this._ancestors.push(start);
            start = start.right;
        }
        this._cursor = start;
    };
    ;
    return Iterator;
}());
exports.Iterator = Iterator;
var Node = (function () {
    function Node(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.red = true;
    }
    Node.prototype.get_child = function (dir) {
        return dir ? this.right : this.left;
    };
    ;
    Node.prototype.set_child = function (dir, val) {
        if (dir) {
            this.right = val;
        }
        else {
            this.left = val;
        }
    };
    ;
    return Node;
}());
var RBTree = (function (_super) {
    __extends(RBTree, _super);
    function RBTree(comparator) {
        var _this = _super.call(this) || this;
        _this._root = null;
        _this._comparator = comparator;
        _this.size = 0;
        return _this;
    }
    RBTree.prototype.insert = function (data) {
        var ret = false;
        if (this._root === null) {
            this._root = new Node(data);
            ret = true;
            this.size++;
        }
        else {
            var head = new Node(undefined);
            var dir = false;
            var last = false;
            var gp = null;
            var ggp = head;
            var p = null;
            var node = this._root;
            ggp.right = this._root;
            while (true) {
                if (node === null) {
                    node = new Node(data);
                    p.set_child(dir, node);
                    ret = true;
                    this.size++;
                }
                else if (RBTree.is_red(node.left) && RBTree.is_red(node.right)) {
                    node.red = true;
                    node.left.red = false;
                    node.right.red = false;
                }
                if (RBTree.is_red(node) && RBTree.is_red(p)) {
                    var dir2 = ggp.right === gp;
                    if (node === p.get_child(last)) {
                        ggp.set_child(dir2, RBTree.single_rotate(gp, !last));
                    }
                    else {
                        ggp.set_child(dir2, RBTree.double_rotate(gp, !last));
                    }
                }
                var cmp = this._comparator(node.data, data);
                if (cmp === 0) {
                    break;
                }
                last = dir;
                dir = cmp < 0;
                if (gp !== null) {
                    ggp = gp;
                }
                gp = p;
                p = node;
                node = node.get_child(dir);
            }
            this._root = head.right;
        }
        this._root.red = false;
        return ret;
    };
    ;
    RBTree.prototype.remove = function (data) {
        if (this._root === null) {
            return false;
        }
        var head = new Node(undefined);
        var node = head;
        node.right = this._root;
        var p = null;
        var gp = null;
        var found = null;
        var dir = true;
        while (node.get_child(dir) !== null) {
            var last = dir;
            gp = p;
            p = node;
            node = node.get_child(dir);
            var cmp = this._comparator(data, node.data);
            dir = cmp > 0;
            if (cmp === 0) {
                found = node;
            }
            if (!RBTree.is_red(node) && !RBTree.is_red(node.get_child(dir))) {
                if (RBTree.is_red(node.get_child(!dir))) {
                    var sr = RBTree.single_rotate(node, dir);
                    p.set_child(last, sr);
                    p = sr;
                }
                else if (!RBTree.is_red(node.get_child(!dir))) {
                    var sibling = p.get_child(!last);
                    if (sibling !== null) {
                        if (!RBTree.is_red(sibling.get_child(!last)) && !RBTree.is_red(sibling.get_child(last))) {
                            p.red = false;
                            sibling.red = true;
                            node.red = true;
                        }
                        else {
                            var dir2 = gp.right === p;
                            if (RBTree.is_red(sibling.get_child(last))) {
                                gp.set_child(dir2, RBTree.double_rotate(p, last));
                            }
                            else if (RBTree.is_red(sibling.get_child(!last))) {
                                gp.set_child(dir2, RBTree.single_rotate(p, last));
                            }
                            var gpc = gp.get_child(dir2);
                            gpc.red = true;
                            node.red = true;
                            gpc.left.red = false;
                            gpc.right.red = false;
                        }
                    }
                }
            }
        }
        if (found !== null) {
            found.data = node.data;
            p.set_child(p.right === node, node.get_child(node.left === null));
            this.size--;
        }
        this._root = head.right;
        if (this._root !== null) {
            this._root.red = false;
        }
        return found !== null;
    };
    ;
    RBTree.is_red = function (node) {
        return node !== null && node.red;
    };
    RBTree.single_rotate = function (root, dir) {
        var save = root.get_child(!dir);
        root.set_child(!dir, save.get_child(dir));
        save.set_child(dir, root);
        root.red = true;
        save.red = false;
        return save;
    };
    RBTree.double_rotate = function (root, dir) {
        root.set_child(!dir, RBTree.single_rotate(root.get_child(!dir), !dir));
        return RBTree.single_rotate(root, dir);
    };
    return RBTree;
}(TreeBase));
exports.RBTree = RBTree;

},{}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var vpsc_1 = require("./vpsc");
var rbtree_1 = require("./rbtree");
function computeGroupBounds(g) {
    g.bounds = typeof g.leaves !== "undefined" ?
        g.leaves.reduce(function (r, c) { return c.bounds.union(r); }, Rectangle.empty()) :
        Rectangle.empty();
    if (typeof g.groups !== "undefined")
        g.bounds = g.groups.reduce(function (r, c) { return computeGroupBounds(c).union(r); }, g.bounds);
    g.bounds = g.bounds.inflate(g.padding);
    return g.bounds;
}
exports.computeGroupBounds = computeGroupBounds;
var Rectangle = (function () {
    function Rectangle(x, X, y, Y) {
        this.x = x;
        this.X = X;
        this.y = y;
        this.Y = Y;
    }
    Rectangle.empty = function () { return new Rectangle(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY); };
    Rectangle.prototype.cx = function () { return (this.x + this.X) / 2; };
    Rectangle.prototype.cy = function () { return (this.y + this.Y) / 2; };
    Rectangle.prototype.overlapX = function (r) {
        var ux = this.cx(), vx = r.cx();
        if (ux <= vx && r.x < this.X)
            return this.X - r.x;
        if (vx <= ux && this.x < r.X)
            return r.X - this.x;
        return 0;
    };
    Rectangle.prototype.overlapY = function (r) {
        var uy = this.cy(), vy = r.cy();
        if (uy <= vy && r.y < this.Y)
            return this.Y - r.y;
        if (vy <= uy && this.y < r.Y)
            return r.Y - this.y;
        return 0;
    };
    Rectangle.prototype.setXCentre = function (cx) {
        var dx = cx - this.cx();
        this.x += dx;
        this.X += dx;
    };
    Rectangle.prototype.setYCentre = function (cy) {
        var dy = cy - this.cy();
        this.y += dy;
        this.Y += dy;
    };
    Rectangle.prototype.width = function () {
        return this.X - this.x;
    };
    Rectangle.prototype.height = function () {
        return this.Y - this.y;
    };
    Rectangle.prototype.union = function (r) {
        return new Rectangle(Math.min(this.x, r.x), Math.max(this.X, r.X), Math.min(this.y, r.y), Math.max(this.Y, r.Y));
    };
    Rectangle.prototype.lineIntersections = function (x1, y1, x2, y2) {
        var sides = [[this.x, this.y, this.X, this.y],
            [this.X, this.y, this.X, this.Y],
            [this.X, this.Y, this.x, this.Y],
            [this.x, this.Y, this.x, this.y]];
        var intersections = [];
        for (var i = 0; i < 4; ++i) {
            var r = Rectangle.lineIntersection(x1, y1, x2, y2, sides[i][0], sides[i][1], sides[i][2], sides[i][3]);
            if (r !== null)
                intersections.push({ x: r.x, y: r.y });
        }
        return intersections;
    };
    Rectangle.prototype.rayIntersection = function (x2, y2) {
        var ints = this.lineIntersections(this.cx(), this.cy(), x2, y2);
        return ints.length > 0 ? ints[0] : null;
    };
    Rectangle.prototype.vertices = function () {
        return [
            { x: this.x, y: this.y },
            { x: this.X, y: this.y },
            { x: this.X, y: this.Y },
            { x: this.x, y: this.Y }
        ];
    };
    Rectangle.lineIntersection = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var dx12 = x2 - x1, dx34 = x4 - x3, dy12 = y2 - y1, dy34 = y4 - y3, denominator = dy34 * dx12 - dx34 * dy12;
        if (denominator == 0)
            return null;
        var dx31 = x1 - x3, dy31 = y1 - y3, numa = dx34 * dy31 - dy34 * dx31, a = numa / denominator, numb = dx12 * dy31 - dy12 * dx31, b = numb / denominator;
        if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
            return {
                x: x1 + a * dx12,
                y: y1 + a * dy12
            };
        }
        return null;
    };
    Rectangle.prototype.inflate = function (pad) {
        return new Rectangle(this.x - pad, this.X + pad, this.y - pad, this.Y + pad);
    };
    return Rectangle;
}());
exports.Rectangle = Rectangle;
function makeEdgeBetween(source, target, ah) {
    var si = source.rayIntersection(target.cx(), target.cy()) || { x: source.cx(), y: source.cy() }, ti = target.rayIntersection(source.cx(), source.cy()) || { x: target.cx(), y: target.cy() }, dx = ti.x - si.x, dy = ti.y - si.y, l = Math.sqrt(dx * dx + dy * dy), al = l - ah;
    return {
        sourceIntersection: si,
        targetIntersection: ti,
        arrowStart: { x: si.x + al * dx / l, y: si.y + al * dy / l }
    };
}
exports.makeEdgeBetween = makeEdgeBetween;
function makeEdgeTo(s, target, ah) {
    var ti = target.rayIntersection(s.x, s.y);
    if (!ti)
        ti = { x: target.cx(), y: target.cy() };
    var dx = ti.x - s.x, dy = ti.y - s.y, l = Math.sqrt(dx * dx + dy * dy);
    return { x: ti.x - ah * dx / l, y: ti.y - ah * dy / l };
}
exports.makeEdgeTo = makeEdgeTo;
var Node = (function () {
    function Node(v, r, pos) {
        this.v = v;
        this.r = r;
        this.pos = pos;
        this.prev = makeRBTree();
        this.next = makeRBTree();
    }
    return Node;
}());
var Event = (function () {
    function Event(isOpen, v, pos) {
        this.isOpen = isOpen;
        this.v = v;
        this.pos = pos;
    }
    return Event;
}());
function compareEvents(a, b) {
    if (a.pos > b.pos) {
        return 1;
    }
    if (a.pos < b.pos) {
        return -1;
    }
    if (a.isOpen) {
        return -1;
    }
    if (b.isOpen) {
        return 1;
    }
    return 0;
}
function makeRBTree() {
    return new rbtree_1.RBTree(function (a, b) { return a.pos - b.pos; });
}
var xRect = {
    getCentre: function (r) { return r.cx(); },
    getOpen: function (r) { return r.y; },
    getClose: function (r) { return r.Y; },
    getSize: function (r) { return r.width(); },
    makeRect: function (open, close, center, size) { return new Rectangle(center - size / 2, center + size / 2, open, close); },
    findNeighbours: findXNeighbours
};
var yRect = {
    getCentre: function (r) { return r.cy(); },
    getOpen: function (r) { return r.x; },
    getClose: function (r) { return r.X; },
    getSize: function (r) { return r.height(); },
    makeRect: function (open, close, center, size) { return new Rectangle(open, close, center - size / 2, center + size / 2); },
    findNeighbours: findYNeighbours
};
function generateGroupConstraints(root, f, minSep, isContained) {
    if (isContained === void 0) { isContained = false; }
    var padding = root.padding, gn = typeof root.groups !== 'undefined' ? root.groups.length : 0, ln = typeof root.leaves !== 'undefined' ? root.leaves.length : 0, childConstraints = !gn ? []
        : root.groups.reduce(function (ccs, g) { return ccs.concat(generateGroupConstraints(g, f, minSep, true)); }, []), n = (isContained ? 2 : 0) + ln + gn, vs = new Array(n), rs = new Array(n), i = 0, add = function (r, v) { rs[i] = r; vs[i++] = v; };
    if (isContained) {
        var b = root.bounds, c = f.getCentre(b), s = f.getSize(b) / 2, open = f.getOpen(b), close = f.getClose(b), min = c - s + padding / 2, max = c + s - padding / 2;
        root.minVar.desiredPosition = min;
        add(f.makeRect(open, close, min, padding), root.minVar);
        root.maxVar.desiredPosition = max;
        add(f.makeRect(open, close, max, padding), root.maxVar);
    }
    if (ln)
        root.leaves.forEach(function (l) { return add(l.bounds, l.variable); });
    if (gn)
        root.groups.forEach(function (g) {
            var b = g.bounds;
            add(f.makeRect(f.getOpen(b), f.getClose(b), f.getCentre(b), f.getSize(b)), g.minVar);
        });
    var cs = generateConstraints(rs, vs, f, minSep);
    if (gn) {
        vs.forEach(function (v) { v.cOut = [], v.cIn = []; });
        cs.forEach(function (c) { c.left.cOut.push(c), c.right.cIn.push(c); });
        root.groups.forEach(function (g) {
            var gapAdjustment = (g.padding - f.getSize(g.bounds)) / 2;
            g.minVar.cIn.forEach(function (c) { return c.gap += gapAdjustment; });
            g.minVar.cOut.forEach(function (c) { c.left = g.maxVar; c.gap += gapAdjustment; });
        });
    }
    return childConstraints.concat(cs);
}
function generateConstraints(rs, vars, rect, minSep) {
    var i, n = rs.length;
    var N = 2 * n;
    console.assert(vars.length >= n);
    var events = new Array(N);
    for (i = 0; i < n; ++i) {
        var r = rs[i];
        var v = new Node(vars[i], r, rect.getCentre(r));
        events[i] = new Event(true, v, rect.getOpen(r));
        events[i + n] = new Event(false, v, rect.getClose(r));
    }
    events.sort(compareEvents);
    var cs = new Array();
    var scanline = makeRBTree();
    for (i = 0; i < N; ++i) {
        var e = events[i];
        var v = e.v;
        if (e.isOpen) {
            scanline.insert(v);
            rect.findNeighbours(v, scanline);
        }
        else {
            scanline.remove(v);
            var makeConstraint = function (l, r) {
                var sep = (rect.getSize(l.r) + rect.getSize(r.r)) / 2 + minSep;
                cs.push(new vpsc_1.Constraint(l.v, r.v, sep));
            };
            var visitNeighbours = function (forward, reverse, mkcon) {
                var u, it = v[forward].iterator();
                while ((u = it[forward]()) !== null) {
                    mkcon(u, v);
                    u[reverse].remove(v);
                }
            };
            visitNeighbours("prev", "next", function (u, v) { return makeConstraint(u, v); });
            visitNeighbours("next", "prev", function (u, v) { return makeConstraint(v, u); });
        }
    }
    console.assert(scanline.size === 0);
    return cs;
}
function findXNeighbours(v, scanline) {
    var f = function (forward, reverse) {
        var it = scanline.findIter(v);
        var u;
        while ((u = it[forward]()) !== null) {
            var uovervX = u.r.overlapX(v.r);
            if (uovervX <= 0 || uovervX <= u.r.overlapY(v.r)) {
                v[forward].insert(u);
                u[reverse].insert(v);
            }
            if (uovervX <= 0) {
                break;
            }
        }
    };
    f("next", "prev");
    f("prev", "next");
}
function findYNeighbours(v, scanline) {
    var f = function (forward, reverse) {
        var u = scanline.findIter(v)[forward]();
        if (u !== null && u.r.overlapX(v.r) > 0) {
            v[forward].insert(u);
            u[reverse].insert(v);
        }
    };
    f("next", "prev");
    f("prev", "next");
}
function generateXConstraints(rs, vars) {
    return generateConstraints(rs, vars, xRect, 1e-6);
}
exports.generateXConstraints = generateXConstraints;
function generateYConstraints(rs, vars) {
    return generateConstraints(rs, vars, yRect, 1e-6);
}
exports.generateYConstraints = generateYConstraints;
function generateXGroupConstraints(root) {
    return generateGroupConstraints(root, xRect, 1e-6);
}
exports.generateXGroupConstraints = generateXGroupConstraints;
function generateYGroupConstraints(root) {
    return generateGroupConstraints(root, yRect, 1e-6);
}
exports.generateYGroupConstraints = generateYGroupConstraints;
function removeOverlaps(rs) {
    var vs = rs.map(function (r) { return new vpsc_1.Variable(r.cx()); });
    var cs = generateXConstraints(rs, vs);
    var solver = new vpsc_1.Solver(vs, cs);
    solver.solve();
    vs.forEach(function (v, i) { return rs[i].setXCentre(v.position()); });
    vs = rs.map(function (r) { return new vpsc_1.Variable(r.cy()); });
    cs = generateYConstraints(rs, vs);
    solver = new vpsc_1.Solver(vs, cs);
    solver.solve();
    vs.forEach(function (v, i) { return rs[i].setYCentre(v.position()); });
}
exports.removeOverlaps = removeOverlaps;
var IndexedVariable = (function (_super) {
    __extends(IndexedVariable, _super);
    function IndexedVariable(index, w) {
        var _this = _super.call(this, 0, w) || this;
        _this.index = index;
        return _this;
    }
    return IndexedVariable;
}(vpsc_1.Variable));
exports.IndexedVariable = IndexedVariable;
var Projection = (function () {
    function Projection(nodes, groups, rootGroup, constraints, avoidOverlaps) {
        if (rootGroup === void 0) { rootGroup = null; }
        if (constraints === void 0) { constraints = null; }
        if (avoidOverlaps === void 0) { avoidOverlaps = false; }
        var _this = this;
        this.nodes = nodes;
        this.groups = groups;
        this.rootGroup = rootGroup;
        this.avoidOverlaps = avoidOverlaps;
        this.variables = nodes.map(function (v, i) {
            return v.variable = new IndexedVariable(i, 1);
        });
        if (constraints)
            this.createConstraints(constraints);
        if (avoidOverlaps && rootGroup && typeof rootGroup.groups !== 'undefined') {
            nodes.forEach(function (v) {
                if (!v.width || !v.height) {
                    v.bounds = new Rectangle(v.x, v.x, v.y, v.y);
                    return;
                }
                var w2 = v.width / 2, h2 = v.height / 2;
                v.bounds = new Rectangle(v.x - w2, v.x + w2, v.y - h2, v.y + h2);
            });
            computeGroupBounds(rootGroup);
            var i = nodes.length;
            groups.forEach(function (g) {
                _this.variables[i] = g.minVar = new IndexedVariable(i++, typeof g.stiffness !== "undefined" ? g.stiffness : 0.01);
                _this.variables[i] = g.maxVar = new IndexedVariable(i++, typeof g.stiffness !== "undefined" ? g.stiffness : 0.01);
            });
        }
    }
    Projection.prototype.createSeparation = function (c) {
        return new vpsc_1.Constraint(this.nodes[c.left].variable, this.nodes[c.right].variable, c.gap, typeof c.equality !== "undefined" ? c.equality : false);
    };
    Projection.prototype.makeFeasible = function (c) {
        var _this = this;
        if (!this.avoidOverlaps)
            return;
        var axis = 'x', dim = 'width';
        if (c.axis === 'x')
            axis = 'y', dim = 'height';
        var vs = c.offsets.map(function (o) { return _this.nodes[o.node]; }).sort(function (a, b) { return a[axis] - b[axis]; });
        var p = null;
        vs.forEach(function (v) {
            if (p) {
                var nextPos = p[axis] + p[dim];
                if (nextPos > v[axis]) {
                    v[axis] = nextPos;
                }
            }
            p = v;
        });
    };
    Projection.prototype.createAlignment = function (c) {
        var _this = this;
        var u = this.nodes[c.offsets[0].node].variable;
        this.makeFeasible(c);
        var cs = c.axis === 'x' ? this.xConstraints : this.yConstraints;
        c.offsets.slice(1).forEach(function (o) {
            var v = _this.nodes[o.node].variable;
            cs.push(new vpsc_1.Constraint(u, v, o.offset, true));
        });
    };
    Projection.prototype.createConstraints = function (constraints) {
        var _this = this;
        var isSep = function (c) { return typeof c.type === 'undefined' || c.type === 'separation'; };
        this.xConstraints = constraints
            .filter(function (c) { return c.axis === "x" && isSep(c); })
            .map(function (c) { return _this.createSeparation(c); });
        this.yConstraints = constraints
            .filter(function (c) { return c.axis === "y" && isSep(c); })
            .map(function (c) { return _this.createSeparation(c); });
        constraints
            .filter(function (c) { return c.type === 'alignment'; })
            .forEach(function (c) { return _this.createAlignment(c); });
    };
    Projection.prototype.setupVariablesAndBounds = function (x0, y0, desired, getDesired) {
        this.nodes.forEach(function (v, i) {
            if (v.fixed) {
                v.variable.weight = v.fixedWeight ? v.fixedWeight : 1000;
                desired[i] = getDesired(v);
            }
            else {
                v.variable.weight = 1;
            }
            var w = (v.width || 0) / 2, h = (v.height || 0) / 2;
            var ix = x0[i], iy = y0[i];
            v.bounds = new Rectangle(ix - w, ix + w, iy - h, iy + h);
        });
    };
    Projection.prototype.xProject = function (x0, y0, x) {
        if (!this.rootGroup && !(this.avoidOverlaps || this.xConstraints))
            return;
        this.project(x0, y0, x0, x, function (v) { return v.px; }, this.xConstraints, generateXGroupConstraints, function (v) { return v.bounds.setXCentre(x[v.variable.index] = v.variable.position()); }, function (g) {
            var xmin = x[g.minVar.index] = g.minVar.position();
            var xmax = x[g.maxVar.index] = g.maxVar.position();
            var p2 = g.padding / 2;
            g.bounds.x = xmin - p2;
            g.bounds.X = xmax + p2;
        });
    };
    Projection.prototype.yProject = function (x0, y0, y) {
        if (!this.rootGroup && !this.yConstraints)
            return;
        this.project(x0, y0, y0, y, function (v) { return v.py; }, this.yConstraints, generateYGroupConstraints, function (v) { return v.bounds.setYCentre(y[v.variable.index] = v.variable.position()); }, function (g) {
            var ymin = y[g.minVar.index] = g.minVar.position();
            var ymax = y[g.maxVar.index] = g.maxVar.position();
            var p2 = g.padding / 2;
            g.bounds.y = ymin - p2;
            ;
            g.bounds.Y = ymax + p2;
        });
    };
    Projection.prototype.projectFunctions = function () {
        var _this = this;
        return [
            function (x0, y0, x) { return _this.xProject(x0, y0, x); },
            function (x0, y0, y) { return _this.yProject(x0, y0, y); }
        ];
    };
    Projection.prototype.project = function (x0, y0, start, desired, getDesired, cs, generateConstraints, updateNodeBounds, updateGroupBounds) {
        this.setupVariablesAndBounds(x0, y0, desired, getDesired);
        if (this.rootGroup && this.avoidOverlaps) {
            computeGroupBounds(this.rootGroup);
            cs = cs.concat(generateConstraints(this.rootGroup));
        }
        this.solve(this.variables, cs, start, desired);
        this.nodes.forEach(updateNodeBounds);
        if (this.rootGroup && this.avoidOverlaps) {
            this.groups.forEach(updateGroupBounds);
            computeGroupBounds(this.rootGroup);
        }
    };
    Projection.prototype.solve = function (vs, cs, starting, desired) {
        var solver = new vpsc_1.Solver(vs, cs);
        solver.setStartingPositions(starting);
        solver.setDesiredPositions(desired);
        solver.solve();
    };
    return Projection;
}());
exports.Projection = Projection;

},{"./rbtree":16,"./vpsc":19}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pqueue_1 = require("./pqueue");
var Neighbour = (function () {
    function Neighbour(id, distance) {
        this.id = id;
        this.distance = distance;
    }
    return Neighbour;
}());
var Node = (function () {
    function Node(id) {
        this.id = id;
        this.neighbours = [];
    }
    return Node;
}());
var QueueEntry = (function () {
    function QueueEntry(node, prev, d) {
        this.node = node;
        this.prev = prev;
        this.d = d;
    }
    return QueueEntry;
}());
var Calculator = (function () {
    function Calculator(n, es, getSourceIndex, getTargetIndex, getLength) {
        this.n = n;
        this.es = es;
        this.neighbours = new Array(this.n);
        var i = this.n;
        while (i--)
            this.neighbours[i] = new Node(i);
        i = this.es.length;
        while (i--) {
            var e = this.es[i];
            var u = getSourceIndex(e), v = getTargetIndex(e);
            var d = getLength(e);
            this.neighbours[u].neighbours.push(new Neighbour(v, d));
            this.neighbours[v].neighbours.push(new Neighbour(u, d));
        }
    }
    Calculator.prototype.DistanceMatrix = function () {
        var D = new Array(this.n);
        for (var i = 0; i < this.n; ++i) {
            D[i] = this.dijkstraNeighbours(i);
        }
        return D;
    };
    Calculator.prototype.DistancesFromNode = function (start) {
        return this.dijkstraNeighbours(start);
    };
    Calculator.prototype.PathFromNodeToNode = function (start, end) {
        return this.dijkstraNeighbours(start, end);
    };
    Calculator.prototype.PathFromNodeToNodeWithPrevCost = function (start, end, prevCost) {
        var q = new pqueue_1.PriorityQueue(function (a, b) { return a.d <= b.d; }), u = this.neighbours[start], qu = new QueueEntry(u, null, 0), visitedFrom = {};
        q.push(qu);
        while (!q.empty()) {
            qu = q.pop();
            u = qu.node;
            if (u.id === end) {
                break;
            }
            var i = u.neighbours.length;
            while (i--) {
                var neighbour = u.neighbours[i], v = this.neighbours[neighbour.id];
                if (qu.prev && v.id === qu.prev.node.id)
                    continue;
                var viduid = v.id + ',' + u.id;
                if (viduid in visitedFrom && visitedFrom[viduid] <= qu.d)
                    continue;
                var cc = qu.prev ? prevCost(qu.prev.node.id, u.id, v.id) : 0, t = qu.d + neighbour.distance + cc;
                visitedFrom[viduid] = t;
                q.push(new QueueEntry(v, qu, t));
            }
        }
        var path = [];
        while (qu.prev) {
            qu = qu.prev;
            path.push(qu.node.id);
        }
        return path;
    };
    Calculator.prototype.dijkstraNeighbours = function (start, dest) {
        if (dest === void 0) { dest = -1; }
        var q = new pqueue_1.PriorityQueue(function (a, b) { return a.d <= b.d; }), i = this.neighbours.length, d = new Array(i);
        while (i--) {
            var node = this.neighbours[i];
            node.d = i === start ? 0 : Number.POSITIVE_INFINITY;
            node.q = q.push(node);
        }
        while (!q.empty()) {
            var u = q.pop();
            d[u.id] = u.d;
            if (u.id === dest) {
                var path = [];
                var v = u;
                while (typeof v.prev !== 'undefined') {
                    path.push(v.prev.id);
                    v = v.prev;
                }
                return path;
            }
            i = u.neighbours.length;
            while (i--) {
                var neighbour = u.neighbours[i];
                var v = this.neighbours[neighbour.id];
                var t = u.d + neighbour.distance;
                if (u.d !== Number.MAX_VALUE && v.d > t) {
                    v.d = t;
                    v.prev = u;
                    q.reduceKey(v.q, v, function (e, q) { return e.q = q; });
                }
            }
        }
        return d;
    };
    return Calculator;
}());
exports.Calculator = Calculator;

},{"./pqueue":15}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PositionStats = (function () {
    function PositionStats(scale) {
        this.scale = scale;
        this.AB = 0;
        this.AD = 0;
        this.A2 = 0;
    }
    PositionStats.prototype.addVariable = function (v) {
        var ai = this.scale / v.scale;
        var bi = v.offset / v.scale;
        var wi = v.weight;
        this.AB += wi * ai * bi;
        this.AD += wi * ai * v.desiredPosition;
        this.A2 += wi * ai * ai;
    };
    PositionStats.prototype.getPosn = function () {
        return (this.AD - this.AB) / this.A2;
    };
    return PositionStats;
}());
exports.PositionStats = PositionStats;
var Constraint = (function () {
    function Constraint(left, right, gap, equality) {
        if (equality === void 0) { equality = false; }
        this.left = left;
        this.right = right;
        this.gap = gap;
        this.equality = equality;
        this.active = false;
        this.unsatisfiable = false;
        this.left = left;
        this.right = right;
        this.gap = gap;
        this.equality = equality;
    }
    Constraint.prototype.slack = function () {
        return this.unsatisfiable ? Number.MAX_VALUE
            : this.right.scale * this.right.position() - this.gap
                - this.left.scale * this.left.position();
    };
    return Constraint;
}());
exports.Constraint = Constraint;
var Variable = (function () {
    function Variable(desiredPosition, weight, scale) {
        if (weight === void 0) { weight = 1; }
        if (scale === void 0) { scale = 1; }
        this.desiredPosition = desiredPosition;
        this.weight = weight;
        this.scale = scale;
        this.offset = 0;
    }
    Variable.prototype.dfdv = function () {
        return 2.0 * this.weight * (this.position() - this.desiredPosition);
    };
    Variable.prototype.position = function () {
        return (this.block.ps.scale * this.block.posn + this.offset) / this.scale;
    };
    Variable.prototype.visitNeighbours = function (prev, f) {
        var ff = function (c, next) { return c.active && prev !== next && f(c, next); };
        this.cOut.forEach(function (c) { return ff(c, c.right); });
        this.cIn.forEach(function (c) { return ff(c, c.left); });
    };
    return Variable;
}());
exports.Variable = Variable;
var Block = (function () {
    function Block(v) {
        this.vars = [];
        v.offset = 0;
        this.ps = new PositionStats(v.scale);
        this.addVariable(v);
    }
    Block.prototype.addVariable = function (v) {
        v.block = this;
        this.vars.push(v);
        this.ps.addVariable(v);
        this.posn = this.ps.getPosn();
    };
    Block.prototype.updateWeightedPosition = function () {
        this.ps.AB = this.ps.AD = this.ps.A2 = 0;
        for (var i = 0, n = this.vars.length; i < n; ++i)
            this.ps.addVariable(this.vars[i]);
        this.posn = this.ps.getPosn();
    };
    Block.prototype.compute_lm = function (v, u, postAction) {
        var _this = this;
        var dfdv = v.dfdv();
        v.visitNeighbours(u, function (c, next) {
            var _dfdv = _this.compute_lm(next, v, postAction);
            if (next === c.right) {
                dfdv += _dfdv * c.left.scale;
                c.lm = _dfdv;
            }
            else {
                dfdv += _dfdv * c.right.scale;
                c.lm = -_dfdv;
            }
            postAction(c);
        });
        return dfdv / v.scale;
    };
    Block.prototype.populateSplitBlock = function (v, prev) {
        var _this = this;
        v.visitNeighbours(prev, function (c, next) {
            next.offset = v.offset + (next === c.right ? c.gap : -c.gap);
            _this.addVariable(next);
            _this.populateSplitBlock(next, v);
        });
    };
    Block.prototype.traverse = function (visit, acc, v, prev) {
        var _this = this;
        if (v === void 0) { v = this.vars[0]; }
        if (prev === void 0) { prev = null; }
        v.visitNeighbours(prev, function (c, next) {
            acc.push(visit(c));
            _this.traverse(visit, acc, next, v);
        });
    };
    Block.prototype.findMinLM = function () {
        var m = null;
        this.compute_lm(this.vars[0], null, function (c) {
            if (!c.equality && (m === null || c.lm < m.lm))
                m = c;
        });
        return m;
    };
    Block.prototype.findMinLMBetween = function (lv, rv) {
        this.compute_lm(lv, null, function () { });
        var m = null;
        this.findPath(lv, null, rv, function (c, next) {
            if (!c.equality && c.right === next && (m === null || c.lm < m.lm))
                m = c;
        });
        return m;
    };
    Block.prototype.findPath = function (v, prev, to, visit) {
        var _this = this;
        var endFound = false;
        v.visitNeighbours(prev, function (c, next) {
            if (!endFound && (next === to || _this.findPath(next, v, to, visit))) {
                endFound = true;
                visit(c, next);
            }
        });
        return endFound;
    };
    Block.prototype.isActiveDirectedPathBetween = function (u, v) {
        if (u === v)
            return true;
        var i = u.cOut.length;
        while (i--) {
            var c = u.cOut[i];
            if (c.active && this.isActiveDirectedPathBetween(c.right, v))
                return true;
        }
        return false;
    };
    Block.split = function (c) {
        c.active = false;
        return [Block.createSplitBlock(c.left), Block.createSplitBlock(c.right)];
    };
    Block.createSplitBlock = function (startVar) {
        var b = new Block(startVar);
        b.populateSplitBlock(startVar, null);
        return b;
    };
    Block.prototype.splitBetween = function (vl, vr) {
        var c = this.findMinLMBetween(vl, vr);
        if (c !== null) {
            var bs = Block.split(c);
            return { constraint: c, lb: bs[0], rb: bs[1] };
        }
        return null;
    };
    Block.prototype.mergeAcross = function (b, c, dist) {
        c.active = true;
        for (var i = 0, n = b.vars.length; i < n; ++i) {
            var v = b.vars[i];
            v.offset += dist;
            this.addVariable(v);
        }
        this.posn = this.ps.getPosn();
    };
    Block.prototype.cost = function () {
        var sum = 0, i = this.vars.length;
        while (i--) {
            var v = this.vars[i], d = v.position() - v.desiredPosition;
            sum += d * d * v.weight;
        }
        return sum;
    };
    return Block;
}());
exports.Block = Block;
var Blocks = (function () {
    function Blocks(vs) {
        this.vs = vs;
        var n = vs.length;
        this.list = new Array(n);
        while (n--) {
            var b = new Block(vs[n]);
            this.list[n] = b;
            b.blockInd = n;
        }
    }
    Blocks.prototype.cost = function () {
        var sum = 0, i = this.list.length;
        while (i--)
            sum += this.list[i].cost();
        return sum;
    };
    Blocks.prototype.insert = function (b) {
        b.blockInd = this.list.length;
        this.list.push(b);
    };
    Blocks.prototype.remove = function (b) {
        var last = this.list.length - 1;
        var swapBlock = this.list[last];
        this.list.length = last;
        if (b !== swapBlock) {
            this.list[b.blockInd] = swapBlock;
            swapBlock.blockInd = b.blockInd;
        }
    };
    Blocks.prototype.merge = function (c) {
        var l = c.left.block, r = c.right.block;
        var dist = c.right.offset - c.left.offset - c.gap;
        if (l.vars.length < r.vars.length) {
            r.mergeAcross(l, c, dist);
            this.remove(l);
        }
        else {
            l.mergeAcross(r, c, -dist);
            this.remove(r);
        }
    };
    Blocks.prototype.forEach = function (f) {
        this.list.forEach(f);
    };
    Blocks.prototype.updateBlockPositions = function () {
        this.list.forEach(function (b) { return b.updateWeightedPosition(); });
    };
    Blocks.prototype.split = function (inactive) {
        var _this = this;
        this.updateBlockPositions();
        this.list.forEach(function (b) {
            var v = b.findMinLM();
            if (v !== null && v.lm < Solver.LAGRANGIAN_TOLERANCE) {
                b = v.left.block;
                Block.split(v).forEach(function (nb) { return _this.insert(nb); });
                _this.remove(b);
                inactive.push(v);
            }
        });
    };
    return Blocks;
}());
exports.Blocks = Blocks;
var Solver = (function () {
    function Solver(vs, cs) {
        this.vs = vs;
        this.cs = cs;
        this.vs = vs;
        vs.forEach(function (v) {
            v.cIn = [], v.cOut = [];
        });
        this.cs = cs;
        cs.forEach(function (c) {
            c.left.cOut.push(c);
            c.right.cIn.push(c);
        });
        this.inactive = cs.map(function (c) { c.active = false; return c; });
        this.bs = null;
    }
    Solver.prototype.cost = function () {
        return this.bs.cost();
    };
    Solver.prototype.setStartingPositions = function (ps) {
        this.inactive = this.cs.map(function (c) { c.active = false; return c; });
        this.bs = new Blocks(this.vs);
        this.bs.forEach(function (b, i) { return b.posn = ps[i]; });
    };
    Solver.prototype.setDesiredPositions = function (ps) {
        this.vs.forEach(function (v, i) { return v.desiredPosition = ps[i]; });
    };
    Solver.prototype.mostViolated = function () {
        var minSlack = Number.MAX_VALUE, v = null, l = this.inactive, n = l.length, deletePoint = n;
        for (var i = 0; i < n; ++i) {
            var c = l[i];
            if (c.unsatisfiable)
                continue;
            var slack = c.slack();
            if (c.equality || slack < minSlack) {
                minSlack = slack;
                v = c;
                deletePoint = i;
                if (c.equality)
                    break;
            }
        }
        if (deletePoint !== n &&
            (minSlack < Solver.ZERO_UPPERBOUND && !v.active || v.equality)) {
            l[deletePoint] = l[n - 1];
            l.length = n - 1;
        }
        return v;
    };
    Solver.prototype.satisfy = function () {
        if (this.bs == null) {
            this.bs = new Blocks(this.vs);
        }
        this.bs.split(this.inactive);
        var v = null;
        while ((v = this.mostViolated()) && (v.equality || v.slack() < Solver.ZERO_UPPERBOUND && !v.active)) {
            var lb = v.left.block, rb = v.right.block;
            if (lb !== rb) {
                this.bs.merge(v);
            }
            else {
                if (lb.isActiveDirectedPathBetween(v.right, v.left)) {
                    v.unsatisfiable = true;
                    continue;
                }
                var split = lb.splitBetween(v.left, v.right);
                if (split !== null) {
                    this.bs.insert(split.lb);
                    this.bs.insert(split.rb);
                    this.bs.remove(lb);
                    this.inactive.push(split.constraint);
                }
                else {
                    v.unsatisfiable = true;
                    continue;
                }
                if (v.slack() >= 0) {
                    this.inactive.push(v);
                }
                else {
                    this.bs.merge(v);
                }
            }
        }
    };
    Solver.prototype.solve = function () {
        this.satisfy();
        var lastcost = Number.MAX_VALUE, cost = this.bs.cost();
        while (Math.abs(lastcost - cost) > 0.0001) {
            this.satisfy();
            lastcost = cost;
            cost = this.bs.cost();
        }
        return cost;
    };
    Solver.LAGRANGIAN_TOLERANCE = -1e-4;
    Solver.ZERO_UPPERBOUND = -1e-10;
    return Solver;
}());
exports.Solver = Solver;
function removeOverlapInOneDimension(spans, lowerBound, upperBound) {
    var vs = spans.map(function (s) { return new Variable(s.desiredCenter); });
    var cs = [];
    var n = spans.length;
    for (var i = 0; i < n - 1; i++) {
        var left = spans[i], right = spans[i + 1];
        cs.push(new Constraint(vs[i], vs[i + 1], (left.size + right.size) / 2));
    }
    var leftMost = vs[0], rightMost = vs[n - 1], leftMostSize = spans[0].size / 2, rightMostSize = spans[n - 1].size / 2;
    var vLower = null, vUpper = null;
    if (lowerBound) {
        vLower = new Variable(lowerBound, leftMost.weight * 1000);
        vs.push(vLower);
        cs.push(new Constraint(vLower, leftMost, leftMostSize));
    }
    if (upperBound) {
        vUpper = new Variable(upperBound, rightMost.weight * 1000);
        vs.push(vUpper);
        cs.push(new Constraint(rightMost, vUpper, rightMostSize));
    }
    var solver = new Solver(vs, cs);
    solver.solve();
    return {
        newCenters: vs.slice(0, spans.length).map(function (v) { return v.position(); }),
        lowerBound: vLower ? vLower.position() : leftMost.position() - leftMostSize,
        upperBound: vUpper ? vUpper.position() : rightMost.position() + rightMostSize
    };
}
exports.removeOverlapInOneDimension = removeOverlapInOneDimension;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2luZGV4LmpzIiwiZGlzdC9zcmMvYWRhcHRvci5qcyIsImRpc3Qvc3JjL2JhdGNoLmpzIiwiZGlzdC9zcmMvZDNhZGFwdG9yLmpzIiwiZGlzdC9zcmMvZDN2M2FkYXB0b3IuanMiLCJkaXN0L3NyYy9kM3Y0YWRhcHRvci5qcyIsImRpc3Qvc3JjL2Rlc2NlbnQuanMiLCJkaXN0L3NyYy9nZW9tLmpzIiwiZGlzdC9zcmMvZ3JpZHJvdXRlci5qcyIsImRpc3Qvc3JjL2hhbmRsZWRpc2Nvbm5lY3RlZC5qcyIsImRpc3Qvc3JjL2xheW91dC5qcyIsImRpc3Qvc3JjL2xheW91dDNkLmpzIiwiZGlzdC9zcmMvbGlua2xlbmd0aHMuanMiLCJkaXN0L3NyYy9wb3dlcmdyYXBoLmpzIiwiZGlzdC9zcmMvcHF1ZXVlLmpzIiwiZGlzdC9zcmMvcmJ0cmVlLmpzIiwiZGlzdC9zcmMvcmVjdGFuZ2xlLmpzIiwiZGlzdC9zcmMvc2hvcnRlc3RwYXRocy5qcyIsImRpc3Qvc3JjL3Zwc2MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvYWRhcHRvclwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9kM2FkYXB0b3JcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvZGVzY2VudFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9nZW9tXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2dyaWRyb3V0ZXJcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvaGFuZGxlZGlzY29ubmVjdGVkXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2xheW91dFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9sYXlvdXQzZFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9saW5rbGVuZ3Roc1wiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9wb3dlcmdyYXBoXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL3BxdWV1ZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9yYnRyZWVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvcmVjdGFuZ2xlXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL3Nob3J0ZXN0cGF0aHNcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvdnBzY1wiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9iYXRjaFwiKSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbGF5b3V0XzEgPSByZXF1aXJlKFwiLi9sYXlvdXRcIik7XHJcbnZhciBMYXlvdXRBZGFwdG9yID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhMYXlvdXRBZGFwdG9yLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gTGF5b3V0QWRhcHRvcihvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICB2YXIgc2VsZiA9IF90aGlzO1xyXG4gICAgICAgIHZhciBvID0gb3B0aW9ucztcclxuICAgICAgICBpZiAoby50cmlnZ2VyKSB7XHJcbiAgICAgICAgICAgIF90aGlzLnRyaWdnZXIgPSBvLnRyaWdnZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvLmtpY2spIHtcclxuICAgICAgICAgICAgX3RoaXMua2ljayA9IG8ua2ljaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG8uZHJhZykge1xyXG4gICAgICAgICAgICBfdGhpcy5kcmFnID0gby5kcmFnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoby5vbikge1xyXG4gICAgICAgICAgICBfdGhpcy5vbiA9IG8ub247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIF90aGlzLmRyYWdzdGFydCA9IF90aGlzLmRyYWdTdGFydCA9IGxheW91dF8xLkxheW91dC5kcmFnU3RhcnQ7XHJcbiAgICAgICAgX3RoaXMuZHJhZ2VuZCA9IF90aGlzLmRyYWdFbmQgPSBsYXlvdXRfMS5MYXlvdXQuZHJhZ0VuZDtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGUpIHsgfTtcclxuICAgIDtcclxuICAgIExheW91dEFkYXB0b3IucHJvdG90eXBlLmtpY2sgPSBmdW5jdGlvbiAoKSB7IH07XHJcbiAgICA7XHJcbiAgICBMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgO1xyXG4gICAgTGF5b3V0QWRhcHRvci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnRUeXBlLCBsaXN0ZW5lcikgeyByZXR1cm4gdGhpczsgfTtcclxuICAgIDtcclxuICAgIHJldHVybiBMYXlvdXRBZGFwdG9yO1xyXG59KGxheW91dF8xLkxheW91dCkpO1xyXG5leHBvcnRzLkxheW91dEFkYXB0b3IgPSBMYXlvdXRBZGFwdG9yO1xyXG5mdW5jdGlvbiBhZGFwdG9yKG9wdGlvbnMpIHtcclxuICAgIHJldHVybiBuZXcgTGF5b3V0QWRhcHRvcihvcHRpb25zKTtcclxufVxyXG5leHBvcnRzLmFkYXB0b3IgPSBhZGFwdG9yO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hZGFwdG9yLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsYXlvdXRfMSA9IHJlcXVpcmUoXCIuL2xheW91dFwiKTtcclxudmFyIGdyaWRyb3V0ZXJfMSA9IHJlcXVpcmUoXCIuL2dyaWRyb3V0ZXJcIik7XHJcbmZ1bmN0aW9uIGdyaWRpZnkocGdMYXlvdXQsIG51ZGdlR2FwLCBtYXJnaW4sIGdyb3VwTWFyZ2luKSB7XHJcbiAgICBwZ0xheW91dC5jb2xhLnN0YXJ0KDAsIDAsIDAsIDEwLCBmYWxzZSk7XHJcbiAgICB2YXIgZ3JpZHJvdXRlciA9IHJvdXRlKHBnTGF5b3V0LmNvbGEubm9kZXMoKSwgcGdMYXlvdXQuY29sYS5ncm91cHMoKSwgbWFyZ2luLCBncm91cE1hcmdpbik7XHJcbiAgICByZXR1cm4gZ3JpZHJvdXRlci5yb3V0ZUVkZ2VzKHBnTGF5b3V0LnBvd2VyR3JhcGgucG93ZXJFZGdlcywgbnVkZ2VHYXAsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZS5yb3V0ZXJOb2RlLmlkOyB9LCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS50YXJnZXQucm91dGVyTm9kZS5pZDsgfSk7XHJcbn1cclxuZXhwb3J0cy5ncmlkaWZ5ID0gZ3JpZGlmeTtcclxuZnVuY3Rpb24gcm91dGUobm9kZXMsIGdyb3VwcywgbWFyZ2luLCBncm91cE1hcmdpbikge1xyXG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQucm91dGVyTm9kZSA9IHtcclxuICAgICAgICAgICAgbmFtZTogZC5uYW1lLFxyXG4gICAgICAgICAgICBib3VuZHM6IGQuYm91bmRzLmluZmxhdGUoLW1hcmdpbilcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICBncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQucm91dGVyTm9kZSA9IHtcclxuICAgICAgICAgICAgYm91bmRzOiBkLmJvdW5kcy5pbmZsYXRlKC1ncm91cE1hcmdpbiksXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiAodHlwZW9mIGQuZ3JvdXBzICE9PSAndW5kZWZpbmVkJyA/IGQuZ3JvdXBzLm1hcChmdW5jdGlvbiAoYykgeyByZXR1cm4gbm9kZXMubGVuZ3RoICsgYy5pZDsgfSkgOiBbXSlcclxuICAgICAgICAgICAgICAgIC5jb25jYXQodHlwZW9mIGQubGVhdmVzICE9PSAndW5kZWZpbmVkJyA/IGQubGVhdmVzLm1hcChmdW5jdGlvbiAoYykgeyByZXR1cm4gYy5pbmRleDsgfSkgOiBbXSlcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICB2YXIgZ3JpZFJvdXRlck5vZGVzID0gbm9kZXMuY29uY2F0KGdyb3VwcykubWFwKGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgZC5yb3V0ZXJOb2RlLmlkID0gaTtcclxuICAgICAgICByZXR1cm4gZC5yb3V0ZXJOb2RlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IGdyaWRyb3V0ZXJfMS5HcmlkUm91dGVyKGdyaWRSb3V0ZXJOb2Rlcywge1xyXG4gICAgICAgIGdldENoaWxkcmVuOiBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5jaGlsZHJlbjsgfSxcclxuICAgICAgICBnZXRCb3VuZHM6IGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LmJvdW5kczsgfVxyXG4gICAgfSwgbWFyZ2luIC0gZ3JvdXBNYXJnaW4pO1xyXG59XHJcbmZ1bmN0aW9uIHBvd2VyR3JhcGhHcmlkTGF5b3V0KGdyYXBoLCBzaXplLCBncm91cHBhZGRpbmcpIHtcclxuICAgIHZhciBwb3dlckdyYXBoO1xyXG4gICAgZ3JhcGgubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gdi5pbmRleCA9IGk7IH0pO1xyXG4gICAgbmV3IGxheW91dF8xLkxheW91dCgpXHJcbiAgICAgICAgLmF2b2lkT3ZlcmxhcHMoZmFsc2UpXHJcbiAgICAgICAgLm5vZGVzKGdyYXBoLm5vZGVzKVxyXG4gICAgICAgIC5saW5rcyhncmFwaC5saW5rcylcclxuICAgICAgICAucG93ZXJHcmFwaEdyb3VwcyhmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIHBvd2VyR3JhcGggPSBkO1xyXG4gICAgICAgIHBvd2VyR3JhcGguZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYucGFkZGluZyA9IGdyb3VwcGFkZGluZzsgfSk7XHJcbiAgICB9KTtcclxuICAgIHZhciBuID0gZ3JhcGgubm9kZXMubGVuZ3RoO1xyXG4gICAgdmFyIGVkZ2VzID0gW107XHJcbiAgICB2YXIgdnMgPSBncmFwaC5ub2Rlcy5zbGljZSgwKTtcclxuICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIHYuaW5kZXggPSBpOyB9KTtcclxuICAgIHBvd2VyR3JhcGguZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICB2YXIgc291cmNlSW5kID0gZy5pbmRleCA9IGcuaWQgKyBuO1xyXG4gICAgICAgIHZzLnB1c2goZyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgIGcubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGVkZ2VzLnB1c2goeyBzb3VyY2U6IHNvdXJjZUluZCwgdGFyZ2V0OiB2LmluZGV4IH0pOyB9KTtcclxuICAgICAgICBpZiAodHlwZW9mIGcuZ3JvdXBzICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgZy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZ2cpIHsgcmV0dXJuIGVkZ2VzLnB1c2goeyBzb3VyY2U6IHNvdXJjZUluZCwgdGFyZ2V0OiBnZy5pZCArIG4gfSk7IH0pO1xyXG4gICAgfSk7XHJcbiAgICBwb3dlckdyYXBoLnBvd2VyRWRnZXMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGVkZ2VzLnB1c2goeyBzb3VyY2U6IGUuc291cmNlLmluZGV4LCB0YXJnZXQ6IGUudGFyZ2V0LmluZGV4IH0pO1xyXG4gICAgfSk7XHJcbiAgICBuZXcgbGF5b3V0XzEuTGF5b3V0KClcclxuICAgICAgICAuc2l6ZShzaXplKVxyXG4gICAgICAgIC5ub2Rlcyh2cylcclxuICAgICAgICAubGlua3MoZWRnZXMpXHJcbiAgICAgICAgLmF2b2lkT3ZlcmxhcHMoZmFsc2UpXHJcbiAgICAgICAgLmxpbmtEaXN0YW5jZSgzMClcclxuICAgICAgICAuc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzKDUpXHJcbiAgICAgICAgLmNvbnZlcmdlbmNlVGhyZXNob2xkKDFlLTQpXHJcbiAgICAgICAgLnN0YXJ0KDEwMCwgMCwgMCwgMCwgZmFsc2UpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2xhOiBuZXcgbGF5b3V0XzEuTGF5b3V0KClcclxuICAgICAgICAgICAgLmNvbnZlcmdlbmNlVGhyZXNob2xkKDFlLTMpXHJcbiAgICAgICAgICAgIC5zaXplKHNpemUpXHJcbiAgICAgICAgICAgIC5hdm9pZE92ZXJsYXBzKHRydWUpXHJcbiAgICAgICAgICAgIC5ub2RlcyhncmFwaC5ub2RlcylcclxuICAgICAgICAgICAgLmxpbmtzKGdyYXBoLmxpbmtzKVxyXG4gICAgICAgICAgICAuZ3JvdXBDb21wYWN0bmVzcygxZS00KVxyXG4gICAgICAgICAgICAubGlua0Rpc3RhbmNlKDMwKVxyXG4gICAgICAgICAgICAuc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzKDUpXHJcbiAgICAgICAgICAgIC5wb3dlckdyYXBoR3JvdXBzKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIHBvd2VyR3JhcGggPSBkO1xyXG4gICAgICAgICAgICBwb3dlckdyYXBoLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICB2LnBhZGRpbmcgPSBncm91cHBhZGRpbmc7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pLnN0YXJ0KDUwLCAwLCAxMDAsIDAsIGZhbHNlKSxcclxuICAgICAgICBwb3dlckdyYXBoOiBwb3dlckdyYXBoXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMucG93ZXJHcmFwaEdyaWRMYXlvdXQgPSBwb3dlckdyYXBoR3JpZExheW91dDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmF0Y2guanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGQzdjMgPSByZXF1aXJlKFwiLi9kM3YzYWRhcHRvclwiKTtcclxudmFyIGQzdjQgPSByZXF1aXJlKFwiLi9kM3Y0YWRhcHRvclwiKTtcclxuO1xyXG5mdW5jdGlvbiBkM2FkYXB0b3IoZDNDb250ZXh0KSB7XHJcbiAgICBpZiAoIWQzQ29udGV4dCB8fCBpc0QzVjMoZDNDb250ZXh0KSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgZDN2My5EM1N0eWxlTGF5b3V0QWRhcHRvcigpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBkM3Y0LkQzU3R5bGVMYXlvdXRBZGFwdG9yKGQzQ29udGV4dCk7XHJcbn1cclxuZXhwb3J0cy5kM2FkYXB0b3IgPSBkM2FkYXB0b3I7XHJcbmZ1bmN0aW9uIGlzRDNWMyhkM0NvbnRleHQpIHtcclxuICAgIHZhciB2M2V4cCA9IC9eM1xcLi87XHJcbiAgICByZXR1cm4gZDNDb250ZXh0LnZlcnNpb24gJiYgZDNDb250ZXh0LnZlcnNpb24ubWF0Y2godjNleHApICE9PSBudWxsO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWQzYWRhcHRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGxheW91dF8xID0gcmVxdWlyZShcIi4vbGF5b3V0XCIpO1xyXG52YXIgRDNTdHlsZUxheW91dEFkYXB0b3IgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKEQzU3R5bGVMYXlvdXRBZGFwdG9yLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRDNTdHlsZUxheW91dEFkYXB0b3IoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5ldmVudCA9IGQzLmRpc3BhdGNoKGxheW91dF8xLkV2ZW50VHlwZVtsYXlvdXRfMS5FdmVudFR5cGUuc3RhcnRdLCBsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLnRpY2tdLCBsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLmVuZF0pO1xyXG4gICAgICAgIHZhciBkM2xheW91dCA9IF90aGlzO1xyXG4gICAgICAgIHZhciBkcmFnO1xyXG4gICAgICAgIF90aGlzLmRyYWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghZHJhZykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuICAgICAgICAgICAgICAgICAgICAub3JpZ2luKGxheW91dF8xLkxheW91dC5kcmFnT3JpZ2luKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImRyYWdzdGFydC5kM2FkYXB0b3JcIiwgbGF5b3V0XzEuTGF5b3V0LmRyYWdTdGFydClcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJkcmFnLmQzYWRhcHRvclwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxheW91dF8xLkxheW91dC5kcmFnKGQsIGQzLmV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBkM2xheW91dC5yZXN1bWUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiZHJhZ2VuZC5kM2FkYXB0b3JcIiwgbGF5b3V0XzEuTGF5b3V0LmRyYWdFbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHJldHVybiBkcmFnO1xyXG4gICAgICAgICAgICB0aGlzXHJcbiAgICAgICAgICAgICAgICAuY2FsbChkcmFnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIEQzU3R5bGVMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB2YXIgZDNldmVudCA9IHsgdHlwZTogbGF5b3V0XzEuRXZlbnRUeXBlW2UudHlwZV0sIGFscGhhOiBlLmFscGhhLCBzdHJlc3M6IGUuc3RyZXNzIH07XHJcbiAgICAgICAgdGhpcy5ldmVudFtkM2V2ZW50LnR5cGVdKGQzZXZlbnQpO1xyXG4gICAgfTtcclxuICAgIEQzU3R5bGVMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS5raWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgZDMudGltZXIoZnVuY3Rpb24gKCkgeyByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS50aWNrLmNhbGwoX3RoaXMpOyB9KTtcclxuICAgIH07XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnRUeXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZXZlbnRUeXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50Lm9uKGV2ZW50VHlwZSwgbGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudC5vbihsYXlvdXRfMS5FdmVudFR5cGVbZXZlbnRUeXBlXSwgbGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICByZXR1cm4gRDNTdHlsZUxheW91dEFkYXB0b3I7XHJcbn0obGF5b3V0XzEuTGF5b3V0KSk7XHJcbmV4cG9ydHMuRDNTdHlsZUxheW91dEFkYXB0b3IgPSBEM1N0eWxlTGF5b3V0QWRhcHRvcjtcclxuZnVuY3Rpb24gZDNhZGFwdG9yKCkge1xyXG4gICAgcmV0dXJuIG5ldyBEM1N0eWxlTGF5b3V0QWRhcHRvcigpO1xyXG59XHJcbmV4cG9ydHMuZDNhZGFwdG9yID0gZDNhZGFwdG9yO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kM3YzYWRhcHRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGxheW91dF8xID0gcmVxdWlyZShcIi4vbGF5b3V0XCIpO1xyXG52YXIgRDNTdHlsZUxheW91dEFkYXB0b3IgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKEQzU3R5bGVMYXlvdXRBZGFwdG9yLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRDNTdHlsZUxheW91dEFkYXB0b3IoZDNDb250ZXh0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5kM0NvbnRleHQgPSBkM0NvbnRleHQ7XHJcbiAgICAgICAgX3RoaXMuZXZlbnQgPSBkM0NvbnRleHQuZGlzcGF0Y2gobGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS5zdGFydF0sIGxheW91dF8xLkV2ZW50VHlwZVtsYXlvdXRfMS5FdmVudFR5cGUudGlja10sIGxheW91dF8xLkV2ZW50VHlwZVtsYXlvdXRfMS5FdmVudFR5cGUuZW5kXSk7XHJcbiAgICAgICAgdmFyIGQzbGF5b3V0ID0gX3RoaXM7XHJcbiAgICAgICAgdmFyIGRyYWc7XHJcbiAgICAgICAgX3RoaXMuZHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFkcmFnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHJhZyA9IGQzQ29udGV4dC5kcmFnKClcclxuICAgICAgICAgICAgICAgICAgICAuc3ViamVjdChsYXlvdXRfMS5MYXlvdXQuZHJhZ09yaWdpbilcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJzdGFydC5kM2FkYXB0b3JcIiwgbGF5b3V0XzEuTGF5b3V0LmRyYWdTdGFydClcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJkcmFnLmQzYWRhcHRvclwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxheW91dF8xLkxheW91dC5kcmFnKGQsIGQzQ29udGV4dC5ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZDNsYXlvdXQucmVzdW1lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImVuZC5kM2FkYXB0b3JcIiwgbGF5b3V0XzEuTGF5b3V0LmRyYWdFbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHJldHVybiBkcmFnO1xyXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0uY2FsbChkcmFnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIEQzU3R5bGVMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB2YXIgZDNldmVudCA9IHsgdHlwZTogbGF5b3V0XzEuRXZlbnRUeXBlW2UudHlwZV0sIGFscGhhOiBlLmFscGhhLCBzdHJlc3M6IGUuc3RyZXNzIH07XHJcbiAgICAgICAgdGhpcy5ldmVudC5jYWxsKGQzZXZlbnQudHlwZSwgZDNldmVudCk7XHJcbiAgICB9O1xyXG4gICAgRDNTdHlsZUxheW91dEFkYXB0b3IucHJvdG90eXBlLmtpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgdCA9IHRoaXMuZDNDb250ZXh0LnRpbWVyKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUudGljay5jYWxsKF90aGlzKSAmJiB0LnN0b3AoKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgRDNTdHlsZUxheW91dEFkYXB0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50VHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudC5vbihldmVudFR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnQub24obGF5b3V0XzEuRXZlbnRUeXBlW2V2ZW50VHlwZV0sIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEQzU3R5bGVMYXlvdXRBZGFwdG9yO1xyXG59KGxheW91dF8xLkxheW91dCkpO1xyXG5leHBvcnRzLkQzU3R5bGVMYXlvdXRBZGFwdG9yID0gRDNTdHlsZUxheW91dEFkYXB0b3I7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWQzdjRhZGFwdG9yLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBMb2NrcyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMb2NrcygpIHtcclxuICAgICAgICB0aGlzLmxvY2tzID0ge307XHJcbiAgICB9XHJcbiAgICBMb2Nrcy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGlkLCB4KSB7XHJcbiAgICAgICAgdGhpcy5sb2Nrc1tpZF0gPSB4O1xyXG4gICAgfTtcclxuICAgIExvY2tzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmxvY2tzID0ge307XHJcbiAgICB9O1xyXG4gICAgTG9ja3MucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbCBpbiB0aGlzLmxvY2tzKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgTG9ja3MucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBmb3IgKHZhciBsIGluIHRoaXMubG9ja3MpIHtcclxuICAgICAgICAgICAgZihOdW1iZXIobCksIHRoaXMubG9ja3NbbF0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gTG9ja3M7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTG9ja3MgPSBMb2NrcztcclxudmFyIERlc2NlbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGVzY2VudCh4LCBELCBHKSB7XHJcbiAgICAgICAgaWYgKEcgPT09IHZvaWQgMCkgeyBHID0gbnVsbDsgfVxyXG4gICAgICAgIHRoaXMuRCA9IEQ7XHJcbiAgICAgICAgdGhpcy5HID0gRztcclxuICAgICAgICB0aGlzLnRocmVzaG9sZCA9IDAuMDAwMTtcclxuICAgICAgICB0aGlzLm51bUdyaWRTbmFwTm9kZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuc25hcEdyaWRTaXplID0gMTAwO1xyXG4gICAgICAgIHRoaXMuc25hcFN0cmVuZ3RoID0gMTAwMDtcclxuICAgICAgICB0aGlzLnNjYWxlU25hcEJ5TWF4SCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmFuZG9tID0gbmV3IFBzZXVkb1JhbmRvbSgpO1xyXG4gICAgICAgIHRoaXMucHJvamVjdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLmsgPSB4Lmxlbmd0aDtcclxuICAgICAgICB2YXIgbiA9IHRoaXMubiA9IHhbMF0ubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuSCA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMuZyA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMuSGQgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmEgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmIgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmMgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmQgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmUgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmlhID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5pYiA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMueHRtcCA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMubG9ja3MgPSBuZXcgTG9ja3MoKTtcclxuICAgICAgICB0aGlzLm1pbkQgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIHZhciBpID0gbiwgajtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIGogPSBuO1xyXG4gICAgICAgICAgICB3aGlsZSAoLS1qID4gaSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSBEW2ldW2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgPiAwICYmIGQgPCB0aGlzLm1pbkQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbkQgPSBkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1pbkQgPT09IE51bWJlci5NQVhfVkFMVUUpXHJcbiAgICAgICAgICAgIHRoaXMubWluRCA9IDE7XHJcbiAgICAgICAgaSA9IHRoaXMuaztcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ1tpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5IW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICBqID0gbjtcclxuICAgICAgICAgICAgd2hpbGUgKGotLSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5IW2ldW2pdID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuSGRbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuYVtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5iW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmNbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuZFtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5lW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmlhW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmliW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLnh0bXBbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXggPSBmdW5jdGlvbiAobiwgZikge1xyXG4gICAgICAgIHZhciBNID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIE1baV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBNW2ldW2pdID0gZihpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gTTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5vZmZzZXREaXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgdSA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHZhciBsID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdVtpXSA9IHRoaXMucmFuZG9tLmdldE5leHRCZXR3ZWVuKDAuMDEsIDEpIC0gMC41O1xyXG4gICAgICAgICAgICBsICs9IHggKiB4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsID0gTWF0aC5zcXJ0KGwpO1xyXG4gICAgICAgIHJldHVybiB1Lm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqPSBfdGhpcy5taW5EIC8gbDsgfSk7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuY29tcHV0ZURlcml2YXRpdmVzID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBuID0gdGhpcy5uO1xyXG4gICAgICAgIGlmIChuIDwgMSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIHZhciBkID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdmFyIGQyID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdmFyIEh1dSA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHZhciBtYXhIID0gMDtcclxuICAgICAgICBmb3IgKHZhciB1ID0gMDsgdSA8IG47ICsrdSkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICBIdXVbaV0gPSB0aGlzLmdbaV1bdV0gPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IG47ICsrdikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHUgPT09IHYpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF4RGlzcGxhY2VzID0gbjtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChtYXhEaXNwbGFjZXMtLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZDIgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLms7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSBkW2ldID0geFtpXVt1XSAtIHhbaV1bdl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNkMiArPSBkMltpXSA9IGR4ICogZHg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZDIgPiAxZS05KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmQgPSB0aGlzLm9mZnNldERpcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLms7ICsraSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFtpXVt2XSArPSByZFtpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBsID0gTWF0aC5zcXJ0KHNkMik7XHJcbiAgICAgICAgICAgICAgICB2YXIgRCA9IHRoaXMuRFt1XVt2XTtcclxuICAgICAgICAgICAgICAgIHZhciB3ZWlnaHQgPSB0aGlzLkcgIT0gbnVsbCA/IHRoaXMuR1t1XVt2XSA6IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAod2VpZ2h0ID4gMSAmJiBsID4gRCB8fCAhaXNGaW5pdGUoRCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuSFtpXVt1XVt2XSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAod2VpZ2h0ID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodCA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgRDIgPSBEICogRDtcclxuICAgICAgICAgICAgICAgIHZhciBncyA9IDIgKiB3ZWlnaHQgKiAobCAtIEQpIC8gKEQyICogbCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbDMgPSBsICogbCAqIGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHMgPSAyICogLXdlaWdodCAvIChEMiAqIGwzKTtcclxuICAgICAgICAgICAgICAgIGlmICghaXNGaW5pdGUoZ3MpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGdzKTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLms7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ1tpXVt1XSArPSBkW2ldICogZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgSHV1W2ldIC09IHRoaXMuSFtpXVt1XVt2XSA9IGhzICogKGwzICsgRCAqIChkMltpXSAtIHNkMikgKyBsICogc2QyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICBtYXhIID0gTWF0aC5tYXgobWF4SCwgdGhpcy5IW2ldW3VdW3VdID0gSHV1W2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHIgPSB0aGlzLnNuYXBHcmlkU2l6ZSAvIDI7XHJcbiAgICAgICAgdmFyIGcgPSB0aGlzLnNuYXBHcmlkU2l6ZTtcclxuICAgICAgICB2YXIgdyA9IHRoaXMuc25hcFN0cmVuZ3RoO1xyXG4gICAgICAgIHZhciBrID0gdyAvIChyICogcik7XHJcbiAgICAgICAgdmFyIG51bU5vZGVzID0gdGhpcy5udW1HcmlkU25hcE5vZGVzO1xyXG4gICAgICAgIGZvciAodmFyIHUgPSAwOyB1IDwgbnVtTm9kZXM7ICsrdSkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4aXUgPSB0aGlzLnhbaV1bdV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbSA9IHhpdSAvIGc7XHJcbiAgICAgICAgICAgICAgICB2YXIgZiA9IG0gJSAxO1xyXG4gICAgICAgICAgICAgICAgdmFyIHEgPSBtIC0gZjtcclxuICAgICAgICAgICAgICAgIHZhciBhID0gTWF0aC5hYnMoZik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHggPSAoYSA8PSAwLjUpID8geGl1IC0gcSAqIGcgOlxyXG4gICAgICAgICAgICAgICAgICAgICh4aXUgPiAwKSA/IHhpdSAtIChxICsgMSkgKiBnIDogeGl1IC0gKHEgLSAxKSAqIGc7XHJcbiAgICAgICAgICAgICAgICBpZiAoLXIgPCBkeCAmJiBkeCA8PSByKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NhbGVTbmFwQnlNYXhIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ1tpXVt1XSArPSBtYXhIICogayAqIGR4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkhbaV1bdV1bdV0gKz0gbWF4SCAqIGs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdbaV1bdV0gKz0gayAqIGR4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkhbaV1bdV1bdV0gKz0gaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmxvY2tzLmlzRW1wdHkoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2tzLmFwcGx5KGZ1bmN0aW9uICh1LCBwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX3RoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuSFtpXVt1XVt1XSArPSBtYXhIO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmdbaV1bdV0gLT0gbWF4SCAqIChwW2ldIC0geFtpXVt1XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEZXNjZW50LmRvdFByb2QgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciB4ID0gMCwgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pXHJcbiAgICAgICAgICAgIHggKz0gYVtpXSAqIGJbaV07XHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5yaWdodE11bHRpcGx5ID0gZnVuY3Rpb24gKG0sIHYsIHIpIHtcclxuICAgICAgICB2YXIgaSA9IG0ubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pXHJcbiAgICAgICAgICAgIHJbaV0gPSBEZXNjZW50LmRvdFByb2QobVtpXSwgdik7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuY29tcHV0ZVN0ZXBTaXplID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgbnVtZXJhdG9yID0gMCwgZGVub21pbmF0b3IgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgbnVtZXJhdG9yICs9IERlc2NlbnQuZG90UHJvZCh0aGlzLmdbaV0sIGRbaV0pO1xyXG4gICAgICAgICAgICBEZXNjZW50LnJpZ2h0TXVsdGlwbHkodGhpcy5IW2ldLCBkW2ldLCB0aGlzLkhkW2ldKTtcclxuICAgICAgICAgICAgZGVub21pbmF0b3IgKz0gRGVzY2VudC5kb3RQcm9kKGRbaV0sIHRoaXMuSGRbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVub21pbmF0b3IgPT09IDAgfHwgIWlzRmluaXRlKGRlbm9taW5hdG9yKSlcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgcmV0dXJuIDEgKiBudW1lcmF0b3IgLyBkZW5vbWluYXRvcjtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5yZWR1Y2VTdHJlc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlRGVyaXZhdGl2ZXModGhpcy54KTtcclxuICAgICAgICB2YXIgYWxwaGEgPSB0aGlzLmNvbXB1dGVTdGVwU2l6ZSh0aGlzLmcpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgdGhpcy50YWtlRGVzY2VudFN0ZXAodGhpcy54W2ldLCB0aGlzLmdbaV0sIGFscGhhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcHV0ZVN0cmVzcygpO1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQuY29weSA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgdmFyIG0gPSBhLmxlbmd0aCwgbiA9IGJbMF0ubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbTsgKytpKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBiW2ldW2pdID0gYVtpXVtqXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5zdGVwQW5kUHJvamVjdCA9IGZ1bmN0aW9uICh4MCwgciwgZCwgc3RlcFNpemUpIHtcclxuICAgICAgICBEZXNjZW50LmNvcHkoeDAsIHIpO1xyXG4gICAgICAgIHRoaXMudGFrZURlc2NlbnRTdGVwKHJbMF0sIGRbMF0sIHN0ZXBTaXplKTtcclxuICAgICAgICBpZiAodGhpcy5wcm9qZWN0KVxyXG4gICAgICAgICAgICB0aGlzLnByb2plY3RbMF0oeDBbMF0sIHgwWzFdLCByWzBdKTtcclxuICAgICAgICB0aGlzLnRha2VEZXNjZW50U3RlcChyWzFdLCBkWzFdLCBzdGVwU2l6ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvamVjdClcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0WzFdKHJbMF0sIHgwWzFdLCByWzFdKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMjsgaSA8IHRoaXMuazsgaSsrKVxyXG4gICAgICAgICAgICB0aGlzLnRha2VEZXNjZW50U3RlcChyW2ldLCBkW2ldLCBzdGVwU2l6ZSk7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5tQXBwbHkgPSBmdW5jdGlvbiAobSwgbiwgZikge1xyXG4gICAgICAgIHZhciBpID0gbTtcclxuICAgICAgICB3aGlsZSAoaS0tID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgaiA9IG47XHJcbiAgICAgICAgICAgIHdoaWxlIChqLS0gPiAwKVxyXG4gICAgICAgICAgICAgICAgZihpLCBqKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUubWF0cml4QXBwbHkgPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIERlc2NlbnQubUFwcGx5KHRoaXMuaywgdGhpcy5uLCBmKTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5jb21wdXRlTmV4dFBvc2l0aW9uID0gZnVuY3Rpb24gKHgwLCByKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLmNvbXB1dGVEZXJpdmF0aXZlcyh4MCk7XHJcbiAgICAgICAgdmFyIGFscGhhID0gdGhpcy5jb21wdXRlU3RlcFNpemUodGhpcy5nKTtcclxuICAgICAgICB0aGlzLnN0ZXBBbmRQcm9qZWN0KHgwLCByLCB0aGlzLmcsIGFscGhhKTtcclxuICAgICAgICBpZiAodGhpcy5wcm9qZWN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4QXBwbHkoZnVuY3Rpb24gKGksIGopIHsgcmV0dXJuIF90aGlzLmVbaV1bal0gPSB4MFtpXVtqXSAtIHJbaV1bal07IH0pO1xyXG4gICAgICAgICAgICB2YXIgYmV0YSA9IHRoaXMuY29tcHV0ZVN0ZXBTaXplKHRoaXMuZSk7XHJcbiAgICAgICAgICAgIGJldGEgPSBNYXRoLm1heCgwLjIsIE1hdGgubWluKGJldGEsIDEpKTtcclxuICAgICAgICAgICAgdGhpcy5zdGVwQW5kUHJvamVjdCh4MCwgciwgdGhpcy5lLCBiZXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGl0ZXJhdGlvbnMpIHtcclxuICAgICAgICB2YXIgc3RyZXNzID0gTnVtYmVyLk1BWF9WQUxVRSwgY29udmVyZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKCFjb252ZXJnZWQgJiYgaXRlcmF0aW9ucy0tID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMucnVuZ2VLdXR0YSgpO1xyXG4gICAgICAgICAgICBjb252ZXJnZWQgPSBNYXRoLmFicyhzdHJlc3MgLyBzIC0gMSkgPCB0aGlzLnRocmVzaG9sZDtcclxuICAgICAgICAgICAgc3RyZXNzID0gcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cmVzcztcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5ydW5nZUt1dHRhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlTmV4dFBvc2l0aW9uKHRoaXMueCwgdGhpcy5hKTtcclxuICAgICAgICBEZXNjZW50Lm1pZCh0aGlzLngsIHRoaXMuYSwgdGhpcy5pYSk7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlTmV4dFBvc2l0aW9uKHRoaXMuaWEsIHRoaXMuYik7XHJcbiAgICAgICAgRGVzY2VudC5taWQodGhpcy54LCB0aGlzLmIsIHRoaXMuaWIpO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZU5leHRQb3NpdGlvbih0aGlzLmliLCB0aGlzLmMpO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZU5leHRQb3NpdGlvbih0aGlzLmMsIHRoaXMuZCk7XHJcbiAgICAgICAgdmFyIGRpc3AgPSAwO1xyXG4gICAgICAgIHRoaXMubWF0cml4QXBwbHkoZnVuY3Rpb24gKGksIGopIHtcclxuICAgICAgICAgICAgdmFyIHggPSAoX3RoaXMuYVtpXVtqXSArIDIuMCAqIF90aGlzLmJbaV1bal0gKyAyLjAgKiBfdGhpcy5jW2ldW2pdICsgX3RoaXMuZFtpXVtqXSkgLyA2LjAsIGQgPSBfdGhpcy54W2ldW2pdIC0geDtcclxuICAgICAgICAgICAgZGlzcCArPSBkICogZDtcclxuICAgICAgICAgICAgX3RoaXMueFtpXVtqXSA9IHg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRpc3A7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5taWQgPSBmdW5jdGlvbiAoYSwgYiwgbSkge1xyXG4gICAgICAgIERlc2NlbnQubUFwcGx5KGEubGVuZ3RoLCBhWzBdLmxlbmd0aCwgZnVuY3Rpb24gKGksIGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1baV1bal0gPSBhW2ldW2pdICsgKGJbaV1bal0gLSBhW2ldW2pdKSAvIDIuMDtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS50YWtlRGVzY2VudFN0ZXAgPSBmdW5jdGlvbiAoeCwgZCwgc3RlcFNpemUpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubjsgKytpKSB7XHJcbiAgICAgICAgICAgIHhbaV0gPSB4W2ldIC0gc3RlcFNpemUgKiBkW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5jb21wdXRlU3RyZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdHJlc3MgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIHUgPSAwLCBuTWludXMxID0gdGhpcy5uIC0gMTsgdSA8IG5NaW51czE7ICsrdSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciB2ID0gdSArIDEsIG4gPSB0aGlzLm47IHYgPCBuOyArK3YpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB0aGlzLnhbaV1bdV0gLSB0aGlzLnhbaV1bdl07XHJcbiAgICAgICAgICAgICAgICAgICAgbCArPSBkeCAqIGR4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbCA9IE1hdGguc3FydChsKTtcclxuICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5EW3VdW3ZdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShkKSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHZhciBybCA9IGQgLSBsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGQyID0gZCAqIGQ7XHJcbiAgICAgICAgICAgICAgICBzdHJlc3MgKz0gcmwgKiBybCAvIGQyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJlc3M7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC56ZXJvRGlzdGFuY2UgPSAxZS0xMDtcclxuICAgIHJldHVybiBEZXNjZW50O1xyXG59KCkpO1xyXG5leHBvcnRzLkRlc2NlbnQgPSBEZXNjZW50O1xyXG52YXIgUHNldWRvUmFuZG9tID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBzZXVkb1JhbmRvbShzZWVkKSB7XHJcbiAgICAgICAgaWYgKHNlZWQgPT09IHZvaWQgMCkgeyBzZWVkID0gMTsgfVxyXG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XHJcbiAgICAgICAgdGhpcy5hID0gMjE0MDEzO1xyXG4gICAgICAgIHRoaXMuYyA9IDI1MzEwMTE7XHJcbiAgICAgICAgdGhpcy5tID0gMjE0NzQ4MzY0ODtcclxuICAgICAgICB0aGlzLnJhbmdlID0gMzI3Njc7XHJcbiAgICB9XHJcbiAgICBQc2V1ZG9SYW5kb20ucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZWVkID0gKHRoaXMuc2VlZCAqIHRoaXMuYSArIHRoaXMuYykgJSB0aGlzLm07XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnNlZWQgPj4gMTYpIC8gdGhpcy5yYW5nZTtcclxuICAgIH07XHJcbiAgICBQc2V1ZG9SYW5kb20ucHJvdG90eXBlLmdldE5leHRCZXR3ZWVuID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgcmV0dXJuIG1pbiArIHRoaXMuZ2V0TmV4dCgpICogKG1heCAtIG1pbik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBzZXVkb1JhbmRvbTtcclxufSgpKTtcclxuZXhwb3J0cy5Qc2V1ZG9SYW5kb20gPSBQc2V1ZG9SYW5kb207XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlc2NlbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciByZWN0YW5nbGVfMSA9IHJlcXVpcmUoXCIuL3JlY3RhbmdsZVwiKTtcclxudmFyIFBvaW50ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBvaW50KCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBvaW50O1xyXG59KCkpO1xyXG5leHBvcnRzLlBvaW50ID0gUG9pbnQ7XHJcbnZhciBMaW5lU2VnbWVudCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMaW5lU2VnbWVudCh4MSwgeTEsIHgyLCB5Mikge1xyXG4gICAgICAgIHRoaXMueDEgPSB4MTtcclxuICAgICAgICB0aGlzLnkxID0geTE7XHJcbiAgICAgICAgdGhpcy54MiA9IHgyO1xyXG4gICAgICAgIHRoaXMueTIgPSB5MjtcclxuICAgIH1cclxuICAgIHJldHVybiBMaW5lU2VnbWVudDtcclxufSgpKTtcclxuZXhwb3J0cy5MaW5lU2VnbWVudCA9IExpbmVTZWdtZW50O1xyXG52YXIgUG9seVBvaW50ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhQb2x5UG9pbnQsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBQb2x5UG9pbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBvbHlQb2ludDtcclxufShQb2ludCkpO1xyXG5leHBvcnRzLlBvbHlQb2ludCA9IFBvbHlQb2ludDtcclxuZnVuY3Rpb24gaXNMZWZ0KFAwLCBQMSwgUDIpIHtcclxuICAgIHJldHVybiAoUDEueCAtIFAwLngpICogKFAyLnkgLSBQMC55KSAtIChQMi54IC0gUDAueCkgKiAoUDEueSAtIFAwLnkpO1xyXG59XHJcbmV4cG9ydHMuaXNMZWZ0ID0gaXNMZWZ0O1xyXG5mdW5jdGlvbiBhYm92ZShwLCB2aSwgdmopIHtcclxuICAgIHJldHVybiBpc0xlZnQocCwgdmksIHZqKSA+IDA7XHJcbn1cclxuZnVuY3Rpb24gYmVsb3cocCwgdmksIHZqKSB7XHJcbiAgICByZXR1cm4gaXNMZWZ0KHAsIHZpLCB2aikgPCAwO1xyXG59XHJcbmZ1bmN0aW9uIENvbnZleEh1bGwoUykge1xyXG4gICAgdmFyIFAgPSBTLnNsaWNlKDApLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEueCAhPT0gYi54ID8gYi54IC0gYS54IDogYi55IC0gYS55OyB9KTtcclxuICAgIHZhciBuID0gUy5sZW5ndGgsIGk7XHJcbiAgICB2YXIgbWlubWluID0gMDtcclxuICAgIHZhciB4bWluID0gUFswXS54O1xyXG4gICAgZm9yIChpID0gMTsgaSA8IG47ICsraSkge1xyXG4gICAgICAgIGlmIChQW2ldLnggIT09IHhtaW4pXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdmFyIG1pbm1heCA9IGkgLSAxO1xyXG4gICAgdmFyIEggPSBbXTtcclxuICAgIEgucHVzaChQW21pbm1pbl0pO1xyXG4gICAgaWYgKG1pbm1heCA9PT0gbiAtIDEpIHtcclxuICAgICAgICBpZiAoUFttaW5tYXhdLnkgIT09IFBbbWlubWluXS55KVxyXG4gICAgICAgICAgICBILnB1c2goUFttaW5tYXhdKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBtYXhtaW4sIG1heG1heCA9IG4gLSAxO1xyXG4gICAgICAgIHZhciB4bWF4ID0gUFtuIC0gMV0ueDtcclxuICAgICAgICBmb3IgKGkgPSBuIC0gMjsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgIGlmIChQW2ldLnggIT09IHhtYXgpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICBtYXhtaW4gPSBpICsgMTtcclxuICAgICAgICBpID0gbWlubWF4O1xyXG4gICAgICAgIHdoaWxlICgrK2kgPD0gbWF4bWluKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0xlZnQoUFttaW5taW5dLCBQW21heG1pbl0sIFBbaV0pID49IDAgJiYgaSA8IG1heG1pbilcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB3aGlsZSAoSC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNMZWZ0KEhbSC5sZW5ndGggLSAyXSwgSFtILmxlbmd0aCAtIDFdLCBQW2ldKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgSC5sZW5ndGggLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPSBtaW5taW4pXHJcbiAgICAgICAgICAgICAgICBILnB1c2goUFtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXhtYXggIT0gbWF4bWluKVxyXG4gICAgICAgICAgICBILnB1c2goUFttYXhtYXhdKTtcclxuICAgICAgICB2YXIgYm90ID0gSC5sZW5ndGg7XHJcbiAgICAgICAgaSA9IG1heG1pbjtcclxuICAgICAgICB3aGlsZSAoLS1pID49IG1pbm1heCkge1xyXG4gICAgICAgICAgICBpZiAoaXNMZWZ0KFBbbWF4bWF4XSwgUFttaW5tYXhdLCBQW2ldKSA+PSAwICYmIGkgPiBtaW5tYXgpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgd2hpbGUgKEgubGVuZ3RoID4gYm90KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNMZWZ0KEhbSC5sZW5ndGggLSAyXSwgSFtILmxlbmd0aCAtIDFdLCBQW2ldKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgSC5sZW5ndGggLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPSBtaW5taW4pXHJcbiAgICAgICAgICAgICAgICBILnB1c2goUFtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEg7XHJcbn1cclxuZXhwb3J0cy5Db252ZXhIdWxsID0gQ29udmV4SHVsbDtcclxuZnVuY3Rpb24gY2xvY2t3aXNlUmFkaWFsU3dlZXAocCwgUCwgZikge1xyXG4gICAgUC5zbGljZSgwKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBNYXRoLmF0YW4yKGEueSAtIHAueSwgYS54IC0gcC54KSAtIE1hdGguYXRhbjIoYi55IC0gcC55LCBiLnggLSBwLngpOyB9KS5mb3JFYWNoKGYpO1xyXG59XHJcbmV4cG9ydHMuY2xvY2t3aXNlUmFkaWFsU3dlZXAgPSBjbG9ja3dpc2VSYWRpYWxTd2VlcDtcclxuZnVuY3Rpb24gbmV4dFBvbHlQb2ludChwLCBwcykge1xyXG4gICAgaWYgKHAucG9seUluZGV4ID09PSBwcy5sZW5ndGggLSAxKVxyXG4gICAgICAgIHJldHVybiBwc1swXTtcclxuICAgIHJldHVybiBwc1twLnBvbHlJbmRleCArIDFdO1xyXG59XHJcbmZ1bmN0aW9uIHByZXZQb2x5UG9pbnQocCwgcHMpIHtcclxuICAgIGlmIChwLnBvbHlJbmRleCA9PT0gMClcclxuICAgICAgICByZXR1cm4gcHNbcHMubGVuZ3RoIC0gMV07XHJcbiAgICByZXR1cm4gcHNbcC5wb2x5SW5kZXggLSAxXTtcclxufVxyXG5mdW5jdGlvbiB0YW5nZW50X1BvaW50UG9seUMoUCwgVikge1xyXG4gICAgdmFyIFZjbG9zZWQgPSBWLnNsaWNlKDApO1xyXG4gICAgVmNsb3NlZC5wdXNoKFZbMF0pO1xyXG4gICAgcmV0dXJuIHsgcnRhbjogUnRhbmdlbnRfUG9pbnRQb2x5QyhQLCBWY2xvc2VkKSwgbHRhbjogTHRhbmdlbnRfUG9pbnRQb2x5QyhQLCBWY2xvc2VkKSB9O1xyXG59XHJcbmZ1bmN0aW9uIFJ0YW5nZW50X1BvaW50UG9seUMoUCwgVikge1xyXG4gICAgdmFyIG4gPSBWLmxlbmd0aCAtIDE7XHJcbiAgICB2YXIgYSwgYiwgYztcclxuICAgIHZhciB1cEEsIGRuQztcclxuICAgIGlmIChiZWxvdyhQLCBWWzFdLCBWWzBdKSAmJiAhYWJvdmUoUCwgVltuIC0gMV0sIFZbMF0pKVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgZm9yIChhID0gMCwgYiA9IG47Oykge1xyXG4gICAgICAgIGlmIChiIC0gYSA9PT0gMSlcclxuICAgICAgICAgICAgaWYgKGFib3ZlKFAsIFZbYV0sIFZbYl0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBiO1xyXG4gICAgICAgIGMgPSBNYXRoLmZsb29yKChhICsgYikgLyAyKTtcclxuICAgICAgICBkbkMgPSBiZWxvdyhQLCBWW2MgKyAxXSwgVltjXSk7XHJcbiAgICAgICAgaWYgKGRuQyAmJiAhYWJvdmUoUCwgVltjIC0gMV0sIFZbY10pKVxyXG4gICAgICAgICAgICByZXR1cm4gYztcclxuICAgICAgICB1cEEgPSBhYm92ZShQLCBWW2EgKyAxXSwgVlthXSk7XHJcbiAgICAgICAgaWYgKHVwQSkge1xyXG4gICAgICAgICAgICBpZiAoZG5DKVxyXG4gICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFib3ZlKFAsIFZbYV0sIFZbY10pKVxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBjO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGEgPSBjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIWRuQylcclxuICAgICAgICAgICAgICAgIGEgPSBjO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChiZWxvdyhQLCBWW2FdLCBWW2NdKSlcclxuICAgICAgICAgICAgICAgICAgICBiID0gYztcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBhID0gYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBMdGFuZ2VudF9Qb2ludFBvbHlDKFAsIFYpIHtcclxuICAgIHZhciBuID0gVi5sZW5ndGggLSAxO1xyXG4gICAgdmFyIGEsIGIsIGM7XHJcbiAgICB2YXIgZG5BLCBkbkM7XHJcbiAgICBpZiAoYWJvdmUoUCwgVltuIC0gMV0sIFZbMF0pICYmICFiZWxvdyhQLCBWWzFdLCBWWzBdKSlcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIGZvciAoYSA9IDAsIGIgPSBuOzspIHtcclxuICAgICAgICBpZiAoYiAtIGEgPT09IDEpXHJcbiAgICAgICAgICAgIGlmIChiZWxvdyhQLCBWW2FdLCBWW2JdKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBhO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYjtcclxuICAgICAgICBjID0gTWF0aC5mbG9vcigoYSArIGIpIC8gMik7XHJcbiAgICAgICAgZG5DID0gYmVsb3coUCwgVltjICsgMV0sIFZbY10pO1xyXG4gICAgICAgIGlmIChhYm92ZShQLCBWW2MgLSAxXSwgVltjXSkgJiYgIWRuQylcclxuICAgICAgICAgICAgcmV0dXJuIGM7XHJcbiAgICAgICAgZG5BID0gYmVsb3coUCwgVlthICsgMV0sIFZbYV0pO1xyXG4gICAgICAgIGlmIChkbkEpIHtcclxuICAgICAgICAgICAgaWYgKCFkbkMpXHJcbiAgICAgICAgICAgICAgICBiID0gYztcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYmVsb3coUCwgVlthXSwgVltjXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgYSA9IGM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChkbkMpXHJcbiAgICAgICAgICAgICAgICBhID0gYztcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWJvdmUoUCwgVlthXSwgVltjXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgYSA9IGM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gdGFuZ2VudF9Qb2x5UG9seUMoViwgVywgdDEsIHQyLCBjbXAxLCBjbXAyKSB7XHJcbiAgICB2YXIgaXgxLCBpeDI7XHJcbiAgICBpeDEgPSB0MShXWzBdLCBWKTtcclxuICAgIGl4MiA9IHQyKFZbaXgxXSwgVyk7XHJcbiAgICB2YXIgZG9uZSA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCFkb25lKSB7XHJcbiAgICAgICAgZG9uZSA9IHRydWU7XHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKGl4MSA9PT0gVi5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICAgICAgaXgxID0gMDtcclxuICAgICAgICAgICAgaWYgKGNtcDEoV1tpeDJdLCBWW2l4MV0sIFZbaXgxICsgMV0pKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICsraXgxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoaXgyID09PSAwKVxyXG4gICAgICAgICAgICAgICAgaXgyID0gVy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBpZiAoY21wMihWW2l4MV0sIFdbaXgyXSwgV1tpeDIgLSAxXSkpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLS1peDI7XHJcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyB0MTogaXgxLCB0MjogaXgyIH07XHJcbn1cclxuZXhwb3J0cy50YW5nZW50X1BvbHlQb2x5QyA9IHRhbmdlbnRfUG9seVBvbHlDO1xyXG5mdW5jdGlvbiBMUnRhbmdlbnRfUG9seVBvbHlDKFYsIFcpIHtcclxuICAgIHZhciBybCA9IFJMdGFuZ2VudF9Qb2x5UG9seUMoVywgVik7XHJcbiAgICByZXR1cm4geyB0MTogcmwudDIsIHQyOiBybC50MSB9O1xyXG59XHJcbmV4cG9ydHMuTFJ0YW5nZW50X1BvbHlQb2x5QyA9IExSdGFuZ2VudF9Qb2x5UG9seUM7XHJcbmZ1bmN0aW9uIFJMdGFuZ2VudF9Qb2x5UG9seUMoViwgVykge1xyXG4gICAgcmV0dXJuIHRhbmdlbnRfUG9seVBvbHlDKFYsIFcsIFJ0YW5nZW50X1BvaW50UG9seUMsIEx0YW5nZW50X1BvaW50UG9seUMsIGFib3ZlLCBiZWxvdyk7XHJcbn1cclxuZXhwb3J0cy5STHRhbmdlbnRfUG9seVBvbHlDID0gUkx0YW5nZW50X1BvbHlQb2x5QztcclxuZnVuY3Rpb24gTEx0YW5nZW50X1BvbHlQb2x5QyhWLCBXKSB7XHJcbiAgICByZXR1cm4gdGFuZ2VudF9Qb2x5UG9seUMoViwgVywgTHRhbmdlbnRfUG9pbnRQb2x5QywgTHRhbmdlbnRfUG9pbnRQb2x5QywgYmVsb3csIGJlbG93KTtcclxufVxyXG5leHBvcnRzLkxMdGFuZ2VudF9Qb2x5UG9seUMgPSBMTHRhbmdlbnRfUG9seVBvbHlDO1xyXG5mdW5jdGlvbiBSUnRhbmdlbnRfUG9seVBvbHlDKFYsIFcpIHtcclxuICAgIHJldHVybiB0YW5nZW50X1BvbHlQb2x5QyhWLCBXLCBSdGFuZ2VudF9Qb2ludFBvbHlDLCBSdGFuZ2VudF9Qb2ludFBvbHlDLCBhYm92ZSwgYWJvdmUpO1xyXG59XHJcbmV4cG9ydHMuUlJ0YW5nZW50X1BvbHlQb2x5QyA9IFJSdGFuZ2VudF9Qb2x5UG9seUM7XHJcbnZhciBCaVRhbmdlbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQmlUYW5nZW50KHQxLCB0Mikge1xyXG4gICAgICAgIHRoaXMudDEgPSB0MTtcclxuICAgICAgICB0aGlzLnQyID0gdDI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQmlUYW5nZW50O1xyXG59KCkpO1xyXG5leHBvcnRzLkJpVGFuZ2VudCA9IEJpVGFuZ2VudDtcclxudmFyIEJpVGFuZ2VudHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQmlUYW5nZW50cygpIHtcclxuICAgIH1cclxuICAgIHJldHVybiBCaVRhbmdlbnRzO1xyXG59KCkpO1xyXG5leHBvcnRzLkJpVGFuZ2VudHMgPSBCaVRhbmdlbnRzO1xyXG52YXIgVFZHUG9pbnQgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFRWR1BvaW50LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gVFZHUG9pbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFRWR1BvaW50O1xyXG59KFBvaW50KSk7XHJcbmV4cG9ydHMuVFZHUG9pbnQgPSBUVkdQb2ludDtcclxudmFyIFZpc2liaWxpdHlWZXJ0ZXggPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmlzaWJpbGl0eVZlcnRleChpZCwgcG9seWlkLCBwb2x5dmVydGlkLCBwKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMucG9seWlkID0gcG9seWlkO1xyXG4gICAgICAgIHRoaXMucG9seXZlcnRpZCA9IHBvbHl2ZXJ0aWQ7XHJcbiAgICAgICAgdGhpcy5wID0gcDtcclxuICAgICAgICBwLnZ2ID0gdGhpcztcclxuICAgIH1cclxuICAgIHJldHVybiBWaXNpYmlsaXR5VmVydGV4O1xyXG59KCkpO1xyXG5leHBvcnRzLlZpc2liaWxpdHlWZXJ0ZXggPSBWaXNpYmlsaXR5VmVydGV4O1xyXG52YXIgVmlzaWJpbGl0eUVkZ2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmlzaWJpbGl0eUVkZ2Uoc291cmNlLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIFZpc2liaWxpdHlFZGdlLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGR4ID0gdGhpcy5zb3VyY2UucC54IC0gdGhpcy50YXJnZXQucC54O1xyXG4gICAgICAgIHZhciBkeSA9IHRoaXMuc291cmNlLnAueSAtIHRoaXMudGFyZ2V0LnAueTtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVmlzaWJpbGl0eUVkZ2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVmlzaWJpbGl0eUVkZ2UgPSBWaXNpYmlsaXR5RWRnZTtcclxudmFyIFRhbmdlbnRWaXNpYmlsaXR5R3JhcGggPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVGFuZ2VudFZpc2liaWxpdHlHcmFwaChQLCBnMCkge1xyXG4gICAgICAgIHRoaXMuUCA9IFA7XHJcbiAgICAgICAgdGhpcy5WID0gW107XHJcbiAgICAgICAgdGhpcy5FID0gW107XHJcbiAgICAgICAgaWYgKCFnMCkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IFAubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBQW2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBqID0gcFtqXSwgdnYgPSBuZXcgVmlzaWJpbGl0eVZlcnRleCh0aGlzLlYubGVuZ3RoLCBpLCBqLCBwaik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5WLnB1c2godnYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5FLnB1c2gobmV3IFZpc2liaWxpdHlFZGdlKHBbaiAtIDFdLnZ2LCB2dikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHAubGVuZ3RoID4gMSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkUucHVzaChuZXcgVmlzaWJpbGl0eUVkZ2UocFswXS52diwgcFtwLmxlbmd0aCAtIDFdLnZ2KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgUGkgPSBQW2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIFBqID0gUFtqXSwgdCA9IHRhbmdlbnRzKFBpLCBQaik7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcSBpbiB0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gdFtxXSwgc291cmNlID0gUGlbYy50MV0sIHRhcmdldCA9IFBqW2MudDJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEVkZ2VJZlZpc2libGUoc291cmNlLCB0YXJnZXQsIGksIGopO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5WID0gZzAuVi5zbGljZSgwKTtcclxuICAgICAgICAgICAgdGhpcy5FID0gZzAuRS5zbGljZSgwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBUYW5nZW50VmlzaWJpbGl0eUdyYXBoLnByb3RvdHlwZS5hZGRFZGdlSWZWaXNpYmxlID0gZnVuY3Rpb24gKHUsIHYsIGkxLCBpMikge1xyXG4gICAgICAgIGlmICghdGhpcy5pbnRlcnNlY3RzUG9seXMobmV3IExpbmVTZWdtZW50KHUueCwgdS55LCB2LngsIHYueSksIGkxLCBpMikpIHtcclxuICAgICAgICAgICAgdGhpcy5FLnB1c2gobmV3IFZpc2liaWxpdHlFZGdlKHUudnYsIHYudnYpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGFuZ2VudFZpc2liaWxpdHlHcmFwaC5wcm90b3R5cGUuYWRkUG9pbnQgPSBmdW5jdGlvbiAocCwgaTEpIHtcclxuICAgICAgICB2YXIgbiA9IHRoaXMuUC5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5WLnB1c2gobmV3IFZpc2liaWxpdHlWZXJ0ZXgodGhpcy5WLmxlbmd0aCwgbiwgMCwgcCkpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBpMSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB2YXIgcG9seSA9IHRoaXMuUFtpXSwgdCA9IHRhbmdlbnRfUG9pbnRQb2x5QyhwLCBwb2x5KTtcclxuICAgICAgICAgICAgdGhpcy5hZGRFZGdlSWZWaXNpYmxlKHAsIHBvbHlbdC5sdGFuXSwgaTEsIGkpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZEVkZ2VJZlZpc2libGUocCwgcG9seVt0LnJ0YW5dLCBpMSwgaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwLnZ2O1xyXG4gICAgfTtcclxuICAgIFRhbmdlbnRWaXNpYmlsaXR5R3JhcGgucHJvdG90eXBlLmludGVyc2VjdHNQb2x5cyA9IGZ1bmN0aW9uIChsLCBpMSwgaTIpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHRoaXMuUC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKGkgIT0gaTEgJiYgaSAhPSBpMiAmJiBpbnRlcnNlY3RzKGwsIHRoaXMuUFtpXSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUYW5nZW50VmlzaWJpbGl0eUdyYXBoO1xyXG59KCkpO1xyXG5leHBvcnRzLlRhbmdlbnRWaXNpYmlsaXR5R3JhcGggPSBUYW5nZW50VmlzaWJpbGl0eUdyYXBoO1xyXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGwsIFApIHtcclxuICAgIHZhciBpbnRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMSwgbiA9IFAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgdmFyIGludCA9IHJlY3RhbmdsZV8xLlJlY3RhbmdsZS5saW5lSW50ZXJzZWN0aW9uKGwueDEsIGwueTEsIGwueDIsIGwueTIsIFBbaSAtIDFdLngsIFBbaSAtIDFdLnksIFBbaV0ueCwgUFtpXS55KTtcclxuICAgICAgICBpZiAoaW50KVxyXG4gICAgICAgICAgICBpbnRzLnB1c2goaW50KTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnRzO1xyXG59XHJcbmZ1bmN0aW9uIHRhbmdlbnRzKFYsIFcpIHtcclxuICAgIHZhciBtID0gVi5sZW5ndGggLSAxLCBuID0gVy5sZW5ndGggLSAxO1xyXG4gICAgdmFyIGJ0ID0gbmV3IEJpVGFuZ2VudHMoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbTsgKytpKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuOyArK2opIHtcclxuICAgICAgICAgICAgdmFyIHYxID0gVltpID09IDAgPyBtIC0gMSA6IGkgLSAxXTtcclxuICAgICAgICAgICAgdmFyIHYyID0gVltpXTtcclxuICAgICAgICAgICAgdmFyIHYzID0gVltpICsgMV07XHJcbiAgICAgICAgICAgIHZhciB3MSA9IFdbaiA9PSAwID8gbiAtIDEgOiBqIC0gMV07XHJcbiAgICAgICAgICAgIHZhciB3MiA9IFdbal07XHJcbiAgICAgICAgICAgIHZhciB3MyA9IFdbaiArIDFdO1xyXG4gICAgICAgICAgICB2YXIgdjF2MncyID0gaXNMZWZ0KHYxLCB2MiwgdzIpO1xyXG4gICAgICAgICAgICB2YXIgdjJ3MXcyID0gaXNMZWZ0KHYyLCB3MSwgdzIpO1xyXG4gICAgICAgICAgICB2YXIgdjJ3MnczID0gaXNMZWZ0KHYyLCB3MiwgdzMpO1xyXG4gICAgICAgICAgICB2YXIgdzF3MnYyID0gaXNMZWZ0KHcxLCB3MiwgdjIpO1xyXG4gICAgICAgICAgICB2YXIgdzJ2MXYyID0gaXNMZWZ0KHcyLCB2MSwgdjIpO1xyXG4gICAgICAgICAgICB2YXIgdzJ2MnYzID0gaXNMZWZ0KHcyLCB2MiwgdjMpO1xyXG4gICAgICAgICAgICBpZiAodjF2MncyID49IDAgJiYgdjJ3MXcyID49IDAgJiYgdjJ3MnczIDwgMFxyXG4gICAgICAgICAgICAgICAgJiYgdzF3MnYyID49IDAgJiYgdzJ2MXYyID49IDAgJiYgdzJ2MnYzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYnQubGwgPSBuZXcgQmlUYW5nZW50KGksIGopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHYxdjJ3MiA8PSAwICYmIHYydzF3MiA8PSAwICYmIHYydzJ3MyA+IDBcclxuICAgICAgICAgICAgICAgICYmIHcxdzJ2MiA8PSAwICYmIHcydjF2MiA8PSAwICYmIHcydjJ2MyA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJ0LnJyID0gbmV3IEJpVGFuZ2VudChpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh2MXYydzIgPD0gMCAmJiB2MncxdzIgPiAwICYmIHYydzJ3MyA8PSAwXHJcbiAgICAgICAgICAgICAgICAmJiB3MXcydjIgPj0gMCAmJiB3MnYxdjIgPCAwICYmIHcydjJ2MyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBidC5ybCA9IG5ldyBCaVRhbmdlbnQoaSwgaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodjF2MncyID49IDAgJiYgdjJ3MXcyIDwgMCAmJiB2MncydzMgPj0gMFxyXG4gICAgICAgICAgICAgICAgJiYgdzF3MnYyIDw9IDAgJiYgdzJ2MXYyID4gMCAmJiB3MnYydjMgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgYnQubHIgPSBuZXcgQmlUYW5nZW50KGksIGopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJ0O1xyXG59XHJcbmV4cG9ydHMudGFuZ2VudHMgPSB0YW5nZW50cztcclxuZnVuY3Rpb24gaXNQb2ludEluc2lkZVBvbHkocCwgcG9seSkge1xyXG4gICAgZm9yICh2YXIgaSA9IDEsIG4gPSBwb2x5Lmxlbmd0aDsgaSA8IG47ICsraSlcclxuICAgICAgICBpZiAoYmVsb3cocG9seVtpIC0gMV0sIHBvbHlbaV0sIHApKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5mdW5jdGlvbiBpc0FueVBJblEocCwgcSkge1xyXG4gICAgcmV0dXJuICFwLmV2ZXJ5KGZ1bmN0aW9uICh2KSB7IHJldHVybiAhaXNQb2ludEluc2lkZVBvbHkodiwgcSk7IH0pO1xyXG59XHJcbmZ1bmN0aW9uIHBvbHlzT3ZlcmxhcChwLCBxKSB7XHJcbiAgICBpZiAoaXNBbnlQSW5RKHAsIHEpKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKGlzQW55UEluUShxLCBwKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGZvciAodmFyIGkgPSAxLCBuID0gcC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICB2YXIgdiA9IHBbaV0sIHUgPSBwW2kgLSAxXTtcclxuICAgICAgICBpZiAoaW50ZXJzZWN0cyhuZXcgTGluZVNlZ21lbnQodS54LCB1LnksIHYueCwgdi55KSwgcSkubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuZXhwb3J0cy5wb2x5c092ZXJsYXAgPSBwb2x5c092ZXJsYXA7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdlb20uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHJlY3RhbmdsZV8xID0gcmVxdWlyZShcIi4vcmVjdGFuZ2xlXCIpO1xyXG52YXIgdnBzY18xID0gcmVxdWlyZShcIi4vdnBzY1wiKTtcclxudmFyIHNob3J0ZXN0cGF0aHNfMSA9IHJlcXVpcmUoXCIuL3Nob3J0ZXN0cGF0aHNcIik7XHJcbnZhciBOb2RlV3JhcHBlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb2RlV3JhcHBlcihpZCwgcmVjdCwgY2hpbGRyZW4pIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5yZWN0ID0gcmVjdDtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgdGhpcy5sZWFmID0gdHlwZW9mIGNoaWxkcmVuID09PSAndW5kZWZpbmVkJyB8fCBjaGlsZHJlbi5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTm9kZVdyYXBwZXI7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTm9kZVdyYXBwZXIgPSBOb2RlV3JhcHBlcjtcclxudmFyIFZlcnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmVydChpZCwgeCwgeSwgbm9kZSwgbGluZSkge1xyXG4gICAgICAgIGlmIChub2RlID09PSB2b2lkIDApIHsgbm9kZSA9IG51bGw7IH1cclxuICAgICAgICBpZiAobGluZSA9PT0gdm9pZCAwKSB7IGxpbmUgPSBudWxsOyB9XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgICAgIHRoaXMubGluZSA9IGxpbmU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVmVydDtcclxufSgpKTtcclxuZXhwb3J0cy5WZXJ0ID0gVmVydDtcclxudmFyIExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UocywgdCkge1xyXG4gICAgICAgIHRoaXMucyA9IHM7XHJcbiAgICAgICAgdGhpcy50ID0gdDtcclxuICAgICAgICB2YXIgbWYgPSBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UuZmluZE1hdGNoKHMsIHQpO1xyXG4gICAgICAgIHZhciB0ciA9IHQuc2xpY2UoMCkucmV2ZXJzZSgpO1xyXG4gICAgICAgIHZhciBtciA9IExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZS5maW5kTWF0Y2gocywgdHIpO1xyXG4gICAgICAgIGlmIChtZi5sZW5ndGggPj0gbXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoID0gbWYubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnNpID0gbWYuc2k7XHJcbiAgICAgICAgICAgIHRoaXMudGkgPSBtZi50aTtcclxuICAgICAgICAgICAgdGhpcy5yZXZlcnNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5sZW5ndGggPSBtci5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMuc2kgPSBtci5zaTtcclxuICAgICAgICAgICAgdGhpcy50aSA9IHQubGVuZ3RoIC0gbXIudGkgLSBtci5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMucmV2ZXJzZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZS5maW5kTWF0Y2ggPSBmdW5jdGlvbiAocywgdCkge1xyXG4gICAgICAgIHZhciBtID0gcy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG4gPSB0Lmxlbmd0aDtcclxuICAgICAgICB2YXIgbWF0Y2ggPSB7IGxlbmd0aDogMCwgc2k6IC0xLCB0aTogLTEgfTtcclxuICAgICAgICB2YXIgbCA9IG5ldyBBcnJheShtKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07IGkrKykge1xyXG4gICAgICAgICAgICBsW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG47IGorKylcclxuICAgICAgICAgICAgICAgIGlmIChzW2ldID09PSB0W2pdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHYgPSBsW2ldW2pdID0gKGkgPT09IDAgfHwgaiA9PT0gMCkgPyAxIDogbFtpIC0gMV1baiAtIDFdICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodiA+IG1hdGNoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5sZW5ndGggPSB2O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5zaSA9IGkgLSB2ICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2gudGkgPSBqIC0gdiArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBsW2ldW2pdID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfTtcclxuICAgIExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZS5wcm90b3R5cGUuZ2V0U2VxdWVuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoID49IDAgPyB0aGlzLnMuc2xpY2UodGhpcy5zaSwgdGhpcy5zaSArIHRoaXMubGVuZ3RoKSA6IFtdO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlID0gTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlO1xyXG52YXIgR3JpZFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBHcmlkUm91dGVyKG9yaWdpbmFsbm9kZXMsIGFjY2Vzc29yLCBncm91cFBhZGRpbmcpIHtcclxuICAgICAgICBpZiAoZ3JvdXBQYWRkaW5nID09PSB2b2lkIDApIHsgZ3JvdXBQYWRkaW5nID0gMTI7IH1cclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxub2RlcyA9IG9yaWdpbmFsbm9kZXM7XHJcbiAgICAgICAgdGhpcy5ncm91cFBhZGRpbmcgPSBncm91cFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5sZWF2ZXMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBvcmlnaW5hbG5vZGVzLm1hcChmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gbmV3IE5vZGVXcmFwcGVyKGksIGFjY2Vzc29yLmdldEJvdW5kcyh2KSwgYWNjZXNzb3IuZ2V0Q2hpbGRyZW4odikpOyB9KTtcclxuICAgICAgICB0aGlzLmxlYXZlcyA9IHRoaXMubm9kZXMuZmlsdGVyKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LmxlYWY7IH0pO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gdGhpcy5ub2Rlcy5maWx0ZXIoZnVuY3Rpb24gKGcpIHsgcmV0dXJuICFnLmxlYWY7IH0pO1xyXG4gICAgICAgIHRoaXMuY29scyA9IHRoaXMuZ2V0R3JpZExpbmVzKCd4Jyk7XHJcbiAgICAgICAgdGhpcy5yb3dzID0gdGhpcy5nZXRHcmlkTGluZXMoJ3knKTtcclxuICAgICAgICB0aGlzLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIF90aGlzLm5vZGVzW2NdLnBhcmVudCA9IHY7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHsgY2hpbGRyZW46IFtdIH07XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygdi5wYXJlbnQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB2LnBhcmVudCA9IF90aGlzLnJvb3Q7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5yb290LmNoaWxkcmVuLnB1c2godi5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdi5wb3J0cyA9IFtdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYmFja1RvRnJvbnQgPSB0aGlzLm5vZGVzLnNsaWNlKDApO1xyXG4gICAgICAgIHRoaXMuYmFja1RvRnJvbnQuc29ydChmdW5jdGlvbiAoeCwgeSkgeyByZXR1cm4gX3RoaXMuZ2V0RGVwdGgoeCkgLSBfdGhpcy5nZXREZXB0aCh5KTsgfSk7XHJcbiAgICAgICAgdmFyIGZyb250VG9CYWNrR3JvdXBzID0gdGhpcy5iYWNrVG9Gcm9udC5zbGljZSgwKS5yZXZlcnNlKCkuZmlsdGVyKGZ1bmN0aW9uIChnKSB7IHJldHVybiAhZy5sZWFmOyB9KTtcclxuICAgICAgICBmcm9udFRvQmFja0dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIHZhciByID0gcmVjdGFuZ2xlXzEuUmVjdGFuZ2xlLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHYuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gciA9IHIudW5pb24oX3RoaXMubm9kZXNbY10ucmVjdCk7IH0pO1xyXG4gICAgICAgICAgICB2LnJlY3QgPSByLmluZmxhdGUoX3RoaXMuZ3JvdXBQYWRkaW5nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgY29sTWlkcyA9IHRoaXMubWlkUG9pbnRzKHRoaXMuY29scy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIucG9zOyB9KSk7XHJcbiAgICAgICAgdmFyIHJvd01pZHMgPSB0aGlzLm1pZFBvaW50cyh0aGlzLnJvd3MubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiByLnBvczsgfSkpO1xyXG4gICAgICAgIHZhciByb3d4ID0gY29sTWlkc1swXSwgcm93WCA9IGNvbE1pZHNbY29sTWlkcy5sZW5ndGggLSAxXTtcclxuICAgICAgICB2YXIgY29seSA9IHJvd01pZHNbMF0sIGNvbFkgPSByb3dNaWRzW3Jvd01pZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgdmFyIGhsaW5lcyA9IHRoaXMucm93cy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuICh7IHgxOiByb3d4LCB4Mjogcm93WCwgeTE6IHIucG9zLCB5Mjogci5wb3MgfSk7IH0pXHJcbiAgICAgICAgICAgIC5jb25jYXQocm93TWlkcy5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuICh7IHgxOiByb3d4LCB4Mjogcm93WCwgeTE6IG0sIHkyOiBtIH0pOyB9KSk7XHJcbiAgICAgICAgdmFyIHZsaW5lcyA9IHRoaXMuY29scy5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuICh7IHgxOiBjLnBvcywgeDI6IGMucG9zLCB5MTogY29seSwgeTI6IGNvbFkgfSk7IH0pXHJcbiAgICAgICAgICAgIC5jb25jYXQoY29sTWlkcy5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuICh7IHgxOiBtLCB4MjogbSwgeTE6IGNvbHksIHkyOiBjb2xZIH0pOyB9KSk7XHJcbiAgICAgICAgdmFyIGxpbmVzID0gaGxpbmVzLmNvbmNhdCh2bGluZXMpO1xyXG4gICAgICAgIGxpbmVzLmZvckVhY2goZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGwudmVydHMgPSBbXTsgfSk7XHJcbiAgICAgICAgdGhpcy52ZXJ0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuICAgICAgICBobGluZXMuZm9yRWFjaChmdW5jdGlvbiAoaCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmxpbmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwID0gbmV3IFZlcnQoX3RoaXMudmVydHMubGVuZ3RoLCB2LngxLCBoLnkxKTtcclxuICAgICAgICAgICAgICAgIGgudmVydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgIHYudmVydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnZlcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSA9IF90aGlzLmJhY2tUb0Zyb250Lmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpLS0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBfdGhpcy5iYWNrVG9Gcm9udFtpXSwgciA9IG5vZGUucmVjdDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyhwLnggLSByLmN4KCkpLCBkeSA9IE1hdGguYWJzKHAueSAtIHIuY3koKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGR4IDwgci53aWR0aCgpIC8gMiAmJiBkeSA8IHIuaGVpZ2h0KCkgLyAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHAubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGluZXMuZm9yRWFjaChmdW5jdGlvbiAobCwgbGkpIHtcclxuICAgICAgICAgICAgX3RoaXMubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICAgICAgdi5yZWN0LmxpbmVJbnRlcnNlY3Rpb25zKGwueDEsIGwueTEsIGwueDIsIGwueTIpLmZvckVhY2goZnVuY3Rpb24gKGludGVyc2VjdCwgaikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwID0gbmV3IFZlcnQoX3RoaXMudmVydHMubGVuZ3RoLCBpbnRlcnNlY3QueCwgaW50ZXJzZWN0LnksIHYsIGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnZlcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbC52ZXJ0cy5wdXNoKHApO1xyXG4gICAgICAgICAgICAgICAgICAgIHYucG9ydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGlzSG9yaXogPSBNYXRoLmFicyhsLnkxIC0gbC55MikgPCAwLjE7XHJcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBpc0hvcml6ID8gYi54IC0gYS54IDogYi55IC0gYS55OyB9O1xyXG4gICAgICAgICAgICBsLnZlcnRzLnNvcnQoZGVsdGEpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGwudmVydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB1ID0gbC52ZXJ0c1tpIC0gMV0sIHYgPSBsLnZlcnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHUubm9kZSAmJiB1Lm5vZGUgPT09IHYubm9kZSAmJiB1Lm5vZGUubGVhZilcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmVkZ2VzLnB1c2goeyBzb3VyY2U6IHUuaWQsIHRhcmdldDogdi5pZCwgbGVuZ3RoOiBNYXRoLmFicyhkZWx0YSh1LCB2KSkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLmF2ZyA9IGZ1bmN0aW9uIChhKSB7IHJldHVybiBhLnJlZHVjZShmdW5jdGlvbiAoeCwgeSkgeyByZXR1cm4geCArIHk7IH0pIC8gYS5sZW5ndGg7IH07XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5nZXRHcmlkTGluZXMgPSBmdW5jdGlvbiAoYXhpcykge1xyXG4gICAgICAgIHZhciBjb2x1bW5zID0gW107XHJcbiAgICAgICAgdmFyIGxzID0gdGhpcy5sZWF2ZXMuc2xpY2UoMCwgdGhpcy5sZWF2ZXMubGVuZ3RoKTtcclxuICAgICAgICB3aGlsZSAobHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgb3ZlcmxhcHBpbmcgPSBscy5maWx0ZXIoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYucmVjdFsnb3ZlcmxhcCcgKyBheGlzLnRvVXBwZXJDYXNlKCldKGxzWzBdLnJlY3QpOyB9KTtcclxuICAgICAgICAgICAgdmFyIGNvbCA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGVzOiBvdmVybGFwcGluZyxcclxuICAgICAgICAgICAgICAgIHBvczogdGhpcy5hdmcob3ZlcmxhcHBpbmcubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnJlY3RbJ2MnICsgYXhpc10oKTsgfSkpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbHVtbnMucHVzaChjb2wpO1xyXG4gICAgICAgICAgICBjb2wubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodikgeyByZXR1cm4gbHMuc3BsaWNlKGxzLmluZGV4T2YodiksIDEpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29sdW1ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLnBvcyAtIGIucG9zOyB9KTtcclxuICAgICAgICByZXR1cm4gY29sdW1ucztcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5nZXREZXB0aCA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIGRlcHRoID0gMDtcclxuICAgICAgICB3aGlsZSAodi5wYXJlbnQgIT09IHRoaXMucm9vdCkge1xyXG4gICAgICAgICAgICBkZXB0aCsrO1xyXG4gICAgICAgICAgICB2ID0gdi5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXB0aDtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5taWRQb2ludHMgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIHZhciBnYXAgPSBhWzFdIC0gYVswXTtcclxuICAgICAgICB2YXIgbWlkcyA9IFthWzBdIC0gZ2FwIC8gMl07XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIG1pZHMucHVzaCgoYVtpXSArIGFbaSAtIDFdKSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtaWRzLnB1c2goYVthLmxlbmd0aCAtIDFdICsgZ2FwIC8gMik7XHJcbiAgICAgICAgcmV0dXJuIG1pZHM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuZmluZExpbmVhZ2UgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBsaW5lYWdlID0gW3ZdO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdiA9IHYucGFyZW50O1xyXG4gICAgICAgICAgICBsaW5lYWdlLnB1c2godik7XHJcbiAgICAgICAgfSB3aGlsZSAodiAhPT0gdGhpcy5yb290KTtcclxuICAgICAgICByZXR1cm4gbGluZWFnZS5yZXZlcnNlKCk7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuZmluZEFuY2VzdG9yUGF0aEJldHdlZW4gPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciBhYSA9IHRoaXMuZmluZExpbmVhZ2UoYSksIGJhID0gdGhpcy5maW5kTGluZWFnZShiKSwgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGFhW2ldID09PSBiYVtpXSlcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIHJldHVybiB7IGNvbW1vbkFuY2VzdG9yOiBhYVtpIC0gMV0sIGxpbmVhZ2VzOiBhYS5zbGljZShpKS5jb25jYXQoYmEuc2xpY2UoaSkpIH07XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuc2libGluZ09ic3RhY2xlcyA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgcGF0aCA9IHRoaXMuZmluZEFuY2VzdG9yUGF0aEJldHdlZW4oYSwgYik7XHJcbiAgICAgICAgdmFyIGxpbmVhZ2VMb29rdXAgPSB7fTtcclxuICAgICAgICBwYXRoLmxpbmVhZ2VzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGxpbmVhZ2VMb29rdXBbdi5pZF0gPSB7fTsgfSk7XHJcbiAgICAgICAgdmFyIG9ic3RhY2xlcyA9IHBhdGguY29tbW9uQW5jZXN0b3IuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uICh2KSB7IHJldHVybiAhKHYgaW4gbGluZWFnZUxvb2t1cCk7IH0pO1xyXG4gICAgICAgIHBhdGgubGluZWFnZXNcclxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAodikgeyByZXR1cm4gdi5wYXJlbnQgIT09IHBhdGguY29tbW9uQW5jZXN0b3I7IH0pXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBvYnN0YWNsZXMgPSBvYnN0YWNsZXMuY29uY2F0KHYucGFyZW50LmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYyAhPT0gdi5pZDsgfSkpOyB9KTtcclxuICAgICAgICByZXR1cm4gb2JzdGFjbGVzLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gX3RoaXMubm9kZXNbdl07IH0pO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIuZ2V0U2VnbWVudFNldHMgPSBmdW5jdGlvbiAocm91dGVzLCB4LCB5KSB7XHJcbiAgICAgICAgdmFyIHZzZWdtZW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGVpID0gMDsgZWkgPCByb3V0ZXMubGVuZ3RoOyBlaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tlaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHNpID0gMDsgc2kgPCByb3V0ZS5sZW5ndGg7IHNpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBzID0gcm91dGVbc2ldO1xyXG4gICAgICAgICAgICAgICAgcy5lZGdlaWQgPSBlaTtcclxuICAgICAgICAgICAgICAgIHMuaSA9IHNpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNkeCA9IHNbMV1beF0gLSBzWzBdW3hdO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHNkeCkgPCAwLjEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2c2VnbWVudHMucHVzaChzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2c2VnbWVudHMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYVswXVt4XSAtIGJbMF1beF07IH0pO1xyXG4gICAgICAgIHZhciB2c2VnbWVudHNldHMgPSBbXTtcclxuICAgICAgICB2YXIgc2VnbWVudHNldCA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2c2VnbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHMgPSB2c2VnbWVudHNbaV07XHJcbiAgICAgICAgICAgIGlmICghc2VnbWVudHNldCB8fCBNYXRoLmFicyhzWzBdW3hdIC0gc2VnbWVudHNldC5wb3MpID4gMC4xKSB7XHJcbiAgICAgICAgICAgICAgICBzZWdtZW50c2V0ID0geyBwb3M6IHNbMF1beF0sIHNlZ21lbnRzOiBbXSB9O1xyXG4gICAgICAgICAgICAgICAgdnNlZ21lbnRzZXRzLnB1c2goc2VnbWVudHNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VnbWVudHNldC5zZWdtZW50cy5wdXNoKHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdnNlZ21lbnRzZXRzO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIubnVkZ2VTZWdzID0gZnVuY3Rpb24gKHgsIHksIHJvdXRlcywgc2VnbWVudHMsIGxlZnRPZiwgZ2FwKSB7XHJcbiAgICAgICAgdmFyIG4gPSBzZWdtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKG4gPD0gMSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciB2cyA9IHNlZ21lbnRzLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gbmV3IHZwc2NfMS5WYXJpYWJsZShzWzBdW3hdKTsgfSk7XHJcbiAgICAgICAgdmFyIGNzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChpID09PSBqKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHMxID0gc2VnbWVudHNbaV0sIHMyID0gc2VnbWVudHNbal0sIGUxID0gczEuZWRnZWlkLCBlMiA9IHMyLmVkZ2VpZCwgbGluZCA9IC0xLCByaW5kID0gLTE7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA9PSAneCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVmdE9mKGUxLCBlMikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMxWzBdW3ldIDwgczFbMV1beV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmQgPSBqLCByaW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmQgPSBpLCByaW5kID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZWZ0T2YoZTEsIGUyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoczFbMF1beV0gPCBzMVsxXVt5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZCA9IGksIHJpbmQgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZCA9IGosIHJpbmQgPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGxpbmQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNzLnB1c2gobmV3IHZwc2NfMS5Db25zdHJhaW50KHZzW2xpbmRdLCB2c1tyaW5kXSwgZ2FwKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNvbHZlciA9IG5ldyB2cHNjXzEuU29sdmVyKHZzLCBjcyk7XHJcbiAgICAgICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICAgICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICB2YXIgcyA9IHNlZ21lbnRzW2ldO1xyXG4gICAgICAgICAgICB2YXIgcG9zID0gdi5wb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBzWzBdW3hdID0gc1sxXVt4XSA9IHBvcztcclxuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW3MuZWRnZWlkXTtcclxuICAgICAgICAgICAgaWYgKHMuaSA+IDApXHJcbiAgICAgICAgICAgICAgICByb3V0ZVtzLmkgLSAxXVsxXVt4XSA9IHBvcztcclxuICAgICAgICAgICAgaWYgKHMuaSA8IHJvdXRlLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgICAgICAgICByb3V0ZVtzLmkgKyAxXVswXVt4XSA9IHBvcztcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLm51ZGdlU2VnbWVudHMgPSBmdW5jdGlvbiAocm91dGVzLCB4LCB5LCBsZWZ0T2YsIGdhcCkge1xyXG4gICAgICAgIHZhciB2c2VnbWVudHNldHMgPSBHcmlkUm91dGVyLmdldFNlZ21lbnRTZXRzKHJvdXRlcywgeCwgeSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2c2VnbWVudHNldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHNzID0gdnNlZ21lbnRzZXRzW2ldO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3Muc2VnbWVudHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBzID0gc3Muc2VnbWVudHNbal07XHJcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaCh7IHR5cGU6IDAsIHM6IHMsIHBvczogTWF0aC5taW4oc1swXVt5XSwgc1sxXVt5XSkgfSk7XHJcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaCh7IHR5cGU6IDEsIHM6IHMsIHBvczogTWF0aC5tYXgoc1swXVt5XSwgc1sxXVt5XSkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEucG9zIC0gYi5wb3MgKyBhLnR5cGUgLSBiLnR5cGU7IH0pO1xyXG4gICAgICAgICAgICB2YXIgb3BlbiA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgb3BlbkNvdW50ID0gMDtcclxuICAgICAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnR5cGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVuLnB1c2goZS5zKTtcclxuICAgICAgICAgICAgICAgICAgICBvcGVuQ291bnQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZW5Db3VudC0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9wZW5Db3VudCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgR3JpZFJvdXRlci5udWRnZVNlZ3MoeCwgeSwgcm91dGVzLCBvcGVuLCBsZWZ0T2YsIGdhcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3BlbiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUucm91dGVFZGdlcyA9IGZ1bmN0aW9uIChlZGdlcywgbnVkZ2VHYXAsIHNvdXJjZSwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgcm91dGVQYXRocyA9IGVkZ2VzLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMucm91dGUoc291cmNlKGUpLCB0YXJnZXQoZSkpOyB9KTtcclxuICAgICAgICB2YXIgb3JkZXIgPSBHcmlkUm91dGVyLm9yZGVyRWRnZXMocm91dGVQYXRocyk7XHJcbiAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlUGF0aHMubWFwKGZ1bmN0aW9uIChlKSB7IHJldHVybiBHcmlkUm91dGVyLm1ha2VTZWdtZW50cyhlKTsgfSk7XHJcbiAgICAgICAgR3JpZFJvdXRlci5udWRnZVNlZ21lbnRzKHJvdXRlcywgJ3gnLCAneScsIG9yZGVyLCBudWRnZUdhcCk7XHJcbiAgICAgICAgR3JpZFJvdXRlci5udWRnZVNlZ21lbnRzKHJvdXRlcywgJ3knLCAneCcsIG9yZGVyLCBudWRnZUdhcCk7XHJcbiAgICAgICAgR3JpZFJvdXRlci51bnJldmVyc2VFZGdlcyhyb3V0ZXMsIHJvdXRlUGF0aHMpO1xyXG4gICAgICAgIHJldHVybiByb3V0ZXM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci51bnJldmVyc2VFZGdlcyA9IGZ1bmN0aW9uIChyb3V0ZXMsIHJvdXRlUGF0aHMpIHtcclxuICAgICAgICByb3V0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc2VnbWVudHMsIGkpIHtcclxuICAgICAgICAgICAgdmFyIHBhdGggPSByb3V0ZVBhdGhzW2ldO1xyXG4gICAgICAgICAgICBpZiAocGF0aC5yZXZlcnNlZCkge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoc2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmFuZ2xlQmV0d2VlbjJMaW5lcyA9IGZ1bmN0aW9uIChsaW5lMSwgbGluZTIpIHtcclxuICAgICAgICB2YXIgYW5nbGUxID0gTWF0aC5hdGFuMihsaW5lMVswXS55IC0gbGluZTFbMV0ueSwgbGluZTFbMF0ueCAtIGxpbmUxWzFdLngpO1xyXG4gICAgICAgIHZhciBhbmdsZTIgPSBNYXRoLmF0YW4yKGxpbmUyWzBdLnkgLSBsaW5lMlsxXS55LCBsaW5lMlswXS54IC0gbGluZTJbMV0ueCk7XHJcbiAgICAgICAgdmFyIGRpZmYgPSBhbmdsZTEgLSBhbmdsZTI7XHJcbiAgICAgICAgaWYgKGRpZmYgPiBNYXRoLlBJIHx8IGRpZmYgPCAtTWF0aC5QSSkge1xyXG4gICAgICAgICAgICBkaWZmID0gYW5nbGUyIC0gYW5nbGUxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGlmZjtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmlzTGVmdCA9IGZ1bmN0aW9uIChhLCBiLCBjKSB7XHJcbiAgICAgICAgcmV0dXJuICgoYi54IC0gYS54KSAqIChjLnkgLSBhLnkpIC0gKGIueSAtIGEueSkgKiAoYy54IC0gYS54KSkgPD0gMDtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmdldE9yZGVyID0gZnVuY3Rpb24gKHBhaXJzKSB7XHJcbiAgICAgICAgdmFyIG91dGdvaW5nID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcCA9IHBhaXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG91dGdvaW5nW3AubF0gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICAgICAgb3V0Z29pbmdbcC5sXSA9IHt9O1xyXG4gICAgICAgICAgICBvdXRnb2luZ1twLmxdW3Aucl0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGwsIHIpIHsgcmV0dXJuIHR5cGVvZiBvdXRnb2luZ1tsXSAhPT0gJ3VuZGVmaW5lZCcgJiYgb3V0Z29pbmdbbF1bcl07IH07XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5vcmRlckVkZ2VzID0gZnVuY3Rpb24gKGVkZ2VzKSB7XHJcbiAgICAgICAgdmFyIGVkZ2VPcmRlciA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGVkZ2VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZSA9IGVkZ2VzW2ldLCBmID0gZWRnZXNbal0sIGxjcyA9IG5ldyBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UoZSwgZik7XHJcbiAgICAgICAgICAgICAgICB2YXIgdSwgdmksIHZqO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxjcy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBpZiAobGNzLnJldmVyc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZi5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZi5yZXZlcnNlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGNzID0gbmV3IExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZShlLCBmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgobGNzLnNpIDw9IDAgfHwgbGNzLnRpIDw9IDApICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKGxjcy5zaSArIGxjcy5sZW5ndGggPj0gZS5sZW5ndGggfHwgbGNzLnRpICsgbGNzLmxlbmd0aCA+PSBmLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlT3JkZXIucHVzaCh7IGw6IGksIHI6IGogfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobGNzLnNpICsgbGNzLmxlbmd0aCA+PSBlLmxlbmd0aCB8fCBsY3MudGkgKyBsY3MubGVuZ3RoID49IGYubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdSA9IGVbbGNzLnNpICsgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmogPSBlW2xjcy5zaSAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpID0gZltsY3MudGkgLSAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHUgPSBlW2xjcy5zaSArIGxjcy5sZW5ndGggLSAyXTtcclxuICAgICAgICAgICAgICAgICAgICB2aSA9IGVbbGNzLnNpICsgbGNzLmxlbmd0aF07XHJcbiAgICAgICAgICAgICAgICAgICAgdmogPSBmW2xjcy50aSArIGxjcy5sZW5ndGhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKEdyaWRSb3V0ZXIuaXNMZWZ0KHUsIHZpLCB2aikpIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlT3JkZXIucHVzaCh7IGw6IGosIHI6IGkgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlT3JkZXIucHVzaCh7IGw6IGksIHI6IGogfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEdyaWRSb3V0ZXIuZ2V0T3JkZXIoZWRnZU9yZGVyKTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uIChwYXRoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gY29weVBvaW50KHApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgeDogcC54LCB5OiBwLnkgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlzU3RyYWlnaHQgPSBmdW5jdGlvbiAoYSwgYiwgYykgeyByZXR1cm4gTWF0aC5hYnMoKGIueCAtIGEueCkgKiAoYy55IC0gYS55KSAtIChiLnkgLSBhLnkpICogKGMueCAtIGEueCkpIDwgMC4wMDE7IH07XHJcbiAgICAgICAgdmFyIHNlZ21lbnRzID0gW107XHJcbiAgICAgICAgdmFyIGEgPSBjb3B5UG9pbnQocGF0aFswXSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBiID0gY29weVBvaW50KHBhdGhbaV0pLCBjID0gaSA8IHBhdGgubGVuZ3RoIC0gMSA/IHBhdGhbaSArIDFdIDogbnVsbDtcclxuICAgICAgICAgICAgaWYgKCFjIHx8ICFpc1N0cmFpZ2h0KGEsIGIsIGMpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKFthLCBiXSk7XHJcbiAgICAgICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2VnbWVudHM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUucm91dGUgPSBmdW5jdGlvbiAocywgdCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNvdXJjZSA9IHRoaXMubm9kZXNbc10sIHRhcmdldCA9IHRoaXMubm9kZXNbdF07XHJcbiAgICAgICAgdGhpcy5vYnN0YWNsZXMgPSB0aGlzLnNpYmxpbmdPYnN0YWNsZXMoc291cmNlLCB0YXJnZXQpO1xyXG4gICAgICAgIHZhciBvYnN0YWNsZUxvb2t1cCA9IHt9O1xyXG4gICAgICAgIHRoaXMub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG9ic3RhY2xlTG9va3VwW28uaWRdID0gbzsgfSk7XHJcbiAgICAgICAgdGhpcy5wYXNzYWJsZUVkZ2VzID0gdGhpcy5lZGdlcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHUgPSBfdGhpcy52ZXJ0c1tlLnNvdXJjZV0sIHYgPSBfdGhpcy52ZXJ0c1tlLnRhcmdldF07XHJcbiAgICAgICAgICAgIHJldHVybiAhKHUubm9kZSAmJiB1Lm5vZGUuaWQgaW4gb2JzdGFjbGVMb29rdXBcclxuICAgICAgICAgICAgICAgIHx8IHYubm9kZSAmJiB2Lm5vZGUuaWQgaW4gb2JzdGFjbGVMb29rdXApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgc291cmNlLnBvcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB1ID0gc291cmNlLnBvcnRzWzBdLmlkO1xyXG4gICAgICAgICAgICB2YXIgdiA9IHNvdXJjZS5wb3J0c1tpXS5pZDtcclxuICAgICAgICAgICAgdGhpcy5wYXNzYWJsZUVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgc291cmNlOiB1LFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB2LFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoOiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRhcmdldC5wb3J0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdSA9IHRhcmdldC5wb3J0c1swXS5pZDtcclxuICAgICAgICAgICAgdmFyIHYgPSB0YXJnZXQucG9ydHNbaV0uaWQ7XHJcbiAgICAgICAgICAgIHRoaXMucGFzc2FibGVFZGdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogdSxcclxuICAgICAgICAgICAgICAgIHRhcmdldDogdixcclxuICAgICAgICAgICAgICAgIGxlbmd0aDogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGdldFNvdXJjZSA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZTsgfSwgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0OyB9LCBnZXRMZW5ndGggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGg7IH07XHJcbiAgICAgICAgdmFyIHNob3J0ZXN0UGF0aENhbGN1bGF0b3IgPSBuZXcgc2hvcnRlc3RwYXRoc18xLkNhbGN1bGF0b3IodGhpcy52ZXJ0cy5sZW5ndGgsIHRoaXMucGFzc2FibGVFZGdlcywgZ2V0U291cmNlLCBnZXRUYXJnZXQsIGdldExlbmd0aCk7XHJcbiAgICAgICAgdmFyIGJlbmRQZW5hbHR5ID0gZnVuY3Rpb24gKHUsIHYsIHcpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBfdGhpcy52ZXJ0c1t1XSwgYiA9IF90aGlzLnZlcnRzW3ZdLCBjID0gX3RoaXMudmVydHNbd107XHJcbiAgICAgICAgICAgIHZhciBkeCA9IE1hdGguYWJzKGMueCAtIGEueCksIGR5ID0gTWF0aC5hYnMoYy55IC0gYS55KTtcclxuICAgICAgICAgICAgaWYgKGEubm9kZSA9PT0gc291cmNlICYmIGEubm9kZSA9PT0gYi5ub2RlIHx8IGIubm9kZSA9PT0gdGFyZ2V0ICYmIGIubm9kZSA9PT0gYy5ub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkeCA+IDEgJiYgZHkgPiAxID8gMTAwMCA6IDA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc2hvcnRlc3RQYXRoID0gc2hvcnRlc3RQYXRoQ2FsY3VsYXRvci5QYXRoRnJvbU5vZGVUb05vZGVXaXRoUHJldkNvc3Qoc291cmNlLnBvcnRzWzBdLmlkLCB0YXJnZXQucG9ydHNbMF0uaWQsIGJlbmRQZW5hbHR5KTtcclxuICAgICAgICB2YXIgcGF0aFBvaW50cyA9IHNob3J0ZXN0UGF0aC5yZXZlcnNlKCkubWFwKGZ1bmN0aW9uICh2aSkgeyByZXR1cm4gX3RoaXMudmVydHNbdmldOyB9KTtcclxuICAgICAgICBwYXRoUG9pbnRzLnB1c2godGhpcy5ub2Rlc1t0YXJnZXQuaWRdLnBvcnRzWzBdKTtcclxuICAgICAgICByZXR1cm4gcGF0aFBvaW50cy5maWx0ZXIoZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEoaSA8IHBhdGhQb2ludHMubGVuZ3RoIC0gMSAmJiBwYXRoUG9pbnRzW2kgKyAxXS5ub2RlID09PSBzb3VyY2UgJiYgdi5ub2RlID09PSBzb3VyY2VcclxuICAgICAgICAgICAgICAgIHx8IGkgPiAwICYmIHYubm9kZSA9PT0gdGFyZ2V0ICYmIHBhdGhQb2ludHNbaSAtIDFdLm5vZGUgPT09IHRhcmdldCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5nZXRSb3V0ZVBhdGggPSBmdW5jdGlvbiAocm91dGUsIGNvcm5lcnJhZGl1cywgYXJyb3d3aWR0aCwgYXJyb3doZWlnaHQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgICAgICByb3V0ZXBhdGg6ICdNICcgKyByb3V0ZVswXVswXS54ICsgJyAnICsgcm91dGVbMF1bMF0ueSArICcgJyxcclxuICAgICAgICAgICAgYXJyb3dwYXRoOiAnJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHJvdXRlLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpID0gcm91dGVbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGxpWzFdLngsIHkgPSBsaVsxXS55O1xyXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0geCAtIGxpWzBdLng7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHkgPSB5IC0gbGlbMF0ueTtcclxuICAgICAgICAgICAgICAgIGlmIChpIDwgcm91dGUubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHggLT0gZHggLyBNYXRoLmFicyhkeCkgKiBjb3JuZXJyYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5IC09IGR5IC8gTWF0aC5hYnMoZHkpICogY29ybmVycmFkaXVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdMICcgKyB4ICsgJyAnICsgeSArICcgJztcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IHJvdXRlW2kgKyAxXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeDAgPSBsWzBdLngsIHkwID0gbFswXS55O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4MSA9IGxbMV0ueDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeTEgPSBsWzFdLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHggPSB4MSAtIHgwO1xyXG4gICAgICAgICAgICAgICAgICAgIGR5ID0geTEgLSB5MDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBHcmlkUm91dGVyLmFuZ2xlQmV0d2VlbjJMaW5lcyhsaSwgbCkgPCAwID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHgyLCB5MjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZHgpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4MiA9IHgwICsgZHggLyBNYXRoLmFicyhkeCkgKiBjb3JuZXJyYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyID0geTA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4MiA9IHgwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5MiA9IHkwICsgZHkgLyBNYXRoLmFicyhkeSkgKiBjb3JuZXJyYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjeCA9IE1hdGguYWJzKHgyIC0geCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN5ID0gTWF0aC5hYnMoeTIgLSB5KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdBICcgKyBjeCArICcgJyArIGN5ICsgJyAwIDAgJyArIGFuZ2xlICsgJyAnICsgeDIgKyAnICcgKyB5MiArICcgJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJvd3RpcCA9IFt4LCB5XTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyb3djb3JuZXIxLCBhcnJvd2Nvcm5lcjI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGR4KSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeCAtPSBkeCAvIE1hdGguYWJzKGR4KSAqIGFycm93aGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCwgeSArIGFycm93d2lkdGhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjIgPSBbeCwgeSAtIGFycm93d2lkdGhdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeSAtPSBkeSAvIE1hdGguYWJzKGR5KSAqIGFycm93aGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCArIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjIgPSBbeCAtIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdMICcgKyB4ICsgJyAnICsgeSArICcgJztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyb3doZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5hcnJvd3BhdGggPSAnTSAnICsgYXJyb3d0aXBbMF0gKyAnICcgKyBhcnJvd3RpcFsxXSArICcgTCAnICsgYXJyb3djb3JuZXIxWzBdICsgJyAnICsgYXJyb3djb3JuZXIxWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArICcgTCAnICsgYXJyb3djb3JuZXIyWzBdICsgJyAnICsgYXJyb3djb3JuZXIyWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGxpID0gcm91dGVbMF07XHJcbiAgICAgICAgICAgIHZhciB4ID0gbGlbMV0ueCwgeSA9IGxpWzFdLnk7XHJcbiAgICAgICAgICAgIHZhciBkeCA9IHggLSBsaVswXS54O1xyXG4gICAgICAgICAgICB2YXIgZHkgPSB5IC0gbGlbMF0ueTtcclxuICAgICAgICAgICAgdmFyIGFycm93dGlwID0gW3gsIHldO1xyXG4gICAgICAgICAgICB2YXIgYXJyb3djb3JuZXIxLCBhcnJvd2Nvcm5lcjI7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB4IC09IGR4IC8gTWF0aC5hYnMoZHgpICogYXJyb3doZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCwgeSArIGFycm93d2lkdGhdO1xyXG4gICAgICAgICAgICAgICAgYXJyb3djb3JuZXIyID0gW3gsIHkgLSBhcnJvd3dpZHRoXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHkgLT0gZHkgLyBNYXRoLmFicyhkeSkgKiBhcnJvd2hlaWdodDtcclxuICAgICAgICAgICAgICAgIGFycm93Y29ybmVyMSA9IFt4ICsgYXJyb3d3aWR0aCwgeV07XHJcbiAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjIgPSBbeCAtIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5yb3V0ZXBhdGggKz0gJ0wgJyArIHggKyAnICcgKyB5ICsgJyAnO1xyXG4gICAgICAgICAgICBpZiAoYXJyb3doZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYXJyb3dwYXRoID0gJ00gJyArIGFycm93dGlwWzBdICsgJyAnICsgYXJyb3d0aXBbMV0gKyAnIEwgJyArIGFycm93Y29ybmVyMVswXSArICcgJyArIGFycm93Y29ybmVyMVsxXVxyXG4gICAgICAgICAgICAgICAgICAgICsgJyBMICcgKyBhcnJvd2Nvcm5lcjJbMF0gKyAnICcgKyBhcnJvd2Nvcm5lcjJbMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gR3JpZFJvdXRlcjtcclxufSgpKTtcclxuZXhwb3J0cy5HcmlkUm91dGVyID0gR3JpZFJvdXRlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z3JpZHJvdXRlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgcGFja2luZ09wdGlvbnMgPSB7XHJcbiAgICBQQURESU5HOiAxMCxcclxuICAgIEdPTERFTl9TRUNUSU9OOiAoMSArIE1hdGguc3FydCg1KSkgLyAyLFxyXG4gICAgRkxPQVRfRVBTSUxPTjogMC4wMDAxLFxyXG4gICAgTUFYX0lORVJBVElPTlM6IDEwMFxyXG59O1xyXG5mdW5jdGlvbiBhcHBseVBhY2tpbmcoZ3JhcGhzLCB3LCBoLCBub2RlX3NpemUsIGRlc2lyZWRfcmF0aW8pIHtcclxuICAgIGlmIChkZXNpcmVkX3JhdGlvID09PSB2b2lkIDApIHsgZGVzaXJlZF9yYXRpbyA9IDE7IH1cclxuICAgIHZhciBpbml0X3ggPSAwLCBpbml0X3kgPSAwLCBzdmdfd2lkdGggPSB3LCBzdmdfaGVpZ2h0ID0gaCwgZGVzaXJlZF9yYXRpbyA9IHR5cGVvZiBkZXNpcmVkX3JhdGlvICE9PSAndW5kZWZpbmVkJyA/IGRlc2lyZWRfcmF0aW8gOiAxLCBub2RlX3NpemUgPSB0eXBlb2Ygbm9kZV9zaXplICE9PSAndW5kZWZpbmVkJyA/IG5vZGVfc2l6ZSA6IDAsIHJlYWxfd2lkdGggPSAwLCByZWFsX2hlaWdodCA9IDAsIG1pbl93aWR0aCA9IDAsIGdsb2JhbF9ib3R0b20gPSAwLCBsaW5lID0gW107XHJcbiAgICBpZiAoZ3JhcGhzLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGNhbGN1bGF0ZV9iYihncmFwaHMpO1xyXG4gICAgYXBwbHkoZ3JhcGhzLCBkZXNpcmVkX3JhdGlvKTtcclxuICAgIHB1dF9ub2Rlc190b19yaWdodF9wb3NpdGlvbnMoZ3JhcGhzKTtcclxuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZV9iYihncmFwaHMpIHtcclxuICAgICAgICBncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICBjYWxjdWxhdGVfc2luZ2xlX2JiKGcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZV9zaW5nbGVfYmIoZ3JhcGgpIHtcclxuICAgICAgICAgICAgdmFyIG1pbl94ID0gTnVtYmVyLk1BWF9WQUxVRSwgbWluX3kgPSBOdW1iZXIuTUFYX1ZBTFVFLCBtYXhfeCA9IDAsIG1heF95ID0gMDtcclxuICAgICAgICAgICAgZ3JhcGguYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHcgPSB0eXBlb2Ygdi53aWR0aCAhPT0gJ3VuZGVmaW5lZCcgPyB2LndpZHRoIDogbm9kZV9zaXplO1xyXG4gICAgICAgICAgICAgICAgdmFyIGggPSB0eXBlb2Ygdi5oZWlnaHQgIT09ICd1bmRlZmluZWQnID8gdi5oZWlnaHQgOiBub2RlX3NpemU7XHJcbiAgICAgICAgICAgICAgICB3IC89IDI7XHJcbiAgICAgICAgICAgICAgICBoIC89IDI7XHJcbiAgICAgICAgICAgICAgICBtYXhfeCA9IE1hdGgubWF4KHYueCArIHcsIG1heF94KTtcclxuICAgICAgICAgICAgICAgIG1pbl94ID0gTWF0aC5taW4odi54IC0gdywgbWluX3gpO1xyXG4gICAgICAgICAgICAgICAgbWF4X3kgPSBNYXRoLm1heCh2LnkgKyBoLCBtYXhfeSk7XHJcbiAgICAgICAgICAgICAgICBtaW5feSA9IE1hdGgubWluKHYueSAtIGgsIG1pbl95KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGdyYXBoLndpZHRoID0gbWF4X3ggLSBtaW5feDtcclxuICAgICAgICAgICAgZ3JhcGguaGVpZ2h0ID0gbWF4X3kgLSBtaW5feTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBwdXRfbm9kZXNfdG9fcmlnaHRfcG9zaXRpb25zKGdyYXBocykge1xyXG4gICAgICAgIGdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgICAgICAgZy5hcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXIueCArPSBub2RlLng7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXIueSArPSBub2RlLnk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZW50ZXIueCAvPSBnLmFycmF5Lmxlbmd0aDtcclxuICAgICAgICAgICAgY2VudGVyLnkgLz0gZy5hcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSB7IHg6IGNlbnRlci54IC0gZy53aWR0aCAvIDIsIHk6IGNlbnRlci55IC0gZy5oZWlnaHQgLyAyIH07XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB7IHg6IGcueCAtIGNvcm5lci54ICsgc3ZnX3dpZHRoIC8gMiAtIHJlYWxfd2lkdGggLyAyLCB5OiBnLnkgLSBjb3JuZXIueSArIHN2Z19oZWlnaHQgLyAyIC0gcmVhbF9oZWlnaHQgLyAyIH07XHJcbiAgICAgICAgICAgIGcuYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS54ICs9IG9mZnNldC54O1xyXG4gICAgICAgICAgICAgICAgbm9kZS55ICs9IG9mZnNldC55O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGFwcGx5KGRhdGEsIGRlc2lyZWRfcmF0aW8pIHtcclxuICAgICAgICB2YXIgY3Vycl9iZXN0X2YgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgdmFyIGN1cnJfYmVzdCA9IDA7XHJcbiAgICAgICAgZGF0YS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiLmhlaWdodCAtIGEuaGVpZ2h0OyB9KTtcclxuICAgICAgICBtaW5fd2lkdGggPSBkYXRhLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS53aWR0aCA8IGIud2lkdGggPyBhLndpZHRoIDogYi53aWR0aDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgbGVmdCA9IHgxID0gbWluX3dpZHRoO1xyXG4gICAgICAgIHZhciByaWdodCA9IHgyID0gZ2V0X2VudGlyZV93aWR0aChkYXRhKTtcclxuICAgICAgICB2YXIgaXRlcmF0aW9uQ291bnRlciA9IDA7XHJcbiAgICAgICAgdmFyIGZfeDEgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIHZhciBmX3gyID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICB2YXIgZmxhZyA9IC0xO1xyXG4gICAgICAgIHZhciBkeCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgdmFyIGRmID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICB3aGlsZSAoKGR4ID4gbWluX3dpZHRoKSB8fCBkZiA+IHBhY2tpbmdPcHRpb25zLkZMT0FUX0VQU0lMT04pIHtcclxuICAgICAgICAgICAgaWYgKGZsYWcgIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHgxID0gcmlnaHQgLSAocmlnaHQgLSBsZWZ0KSAvIHBhY2tpbmdPcHRpb25zLkdPTERFTl9TRUNUSU9OO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZfeDEgPSBzdGVwKGRhdGEsIHgxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmxhZyAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDIgPSBsZWZ0ICsgKHJpZ2h0IC0gbGVmdCkgLyBwYWNraW5nT3B0aW9ucy5HT0xERU5fU0VDVElPTjtcclxuICAgICAgICAgICAgICAgIHZhciBmX3gyID0gc3RlcChkYXRhLCB4Mik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHggPSBNYXRoLmFicyh4MSAtIHgyKTtcclxuICAgICAgICAgICAgZGYgPSBNYXRoLmFicyhmX3gxIC0gZl94Mik7XHJcbiAgICAgICAgICAgIGlmIChmX3gxIDwgY3Vycl9iZXN0X2YpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJfYmVzdF9mID0gZl94MTtcclxuICAgICAgICAgICAgICAgIGN1cnJfYmVzdCA9IHgxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmX3gyIDwgY3Vycl9iZXN0X2YpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJfYmVzdF9mID0gZl94MjtcclxuICAgICAgICAgICAgICAgIGN1cnJfYmVzdCA9IHgyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmX3gxID4gZl94Mikge1xyXG4gICAgICAgICAgICAgICAgbGVmdCA9IHgxO1xyXG4gICAgICAgICAgICAgICAgeDEgPSB4MjtcclxuICAgICAgICAgICAgICAgIGZfeDEgPSBmX3gyO1xyXG4gICAgICAgICAgICAgICAgZmxhZyA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByaWdodCA9IHgyO1xyXG4gICAgICAgICAgICAgICAgeDIgPSB4MTtcclxuICAgICAgICAgICAgICAgIGZfeDIgPSBmX3gxO1xyXG4gICAgICAgICAgICAgICAgZmxhZyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGl0ZXJhdGlvbkNvdW50ZXIrKyA+IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc3RlcChkYXRhLCBjdXJyX2Jlc3QpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChkYXRhLCBtYXhfd2lkdGgpIHtcclxuICAgICAgICBsaW5lID0gW107XHJcbiAgICAgICAgcmVhbF93aWR0aCA9IDA7XHJcbiAgICAgICAgcmVhbF9oZWlnaHQgPSAwO1xyXG4gICAgICAgIGdsb2JhbF9ib3R0b20gPSBpbml0X3k7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBvID0gZGF0YVtpXTtcclxuICAgICAgICAgICAgcHV0X3JlY3QobywgbWF4X3dpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGdldF9yZWFsX3JhdGlvKCkgLSBkZXNpcmVkX3JhdGlvKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHB1dF9yZWN0KHJlY3QsIG1heF93aWR0aCkge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgobGluZVtpXS5zcGFjZV9sZWZ0ID49IHJlY3QuaGVpZ2h0KSAmJiAobGluZVtpXS54ICsgbGluZVtpXS53aWR0aCArIHJlY3Qud2lkdGggKyBwYWNraW5nT3B0aW9ucy5QQURESU5HIC0gbWF4X3dpZHRoKSA8PSBwYWNraW5nT3B0aW9ucy5GTE9BVF9FUFNJTE9OKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBsaW5lW2ldO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZS5wdXNoKHJlY3QpO1xyXG4gICAgICAgIGlmIChwYXJlbnQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSBwYXJlbnQueCArIHBhcmVudC53aWR0aCArIHBhY2tpbmdPcHRpb25zLlBBRERJTkc7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IHBhcmVudC5ib3R0b207XHJcbiAgICAgICAgICAgIHJlY3Quc3BhY2VfbGVmdCA9IHJlY3QuaGVpZ2h0O1xyXG4gICAgICAgICAgICByZWN0LmJvdHRvbSA9IHJlY3QueTtcclxuICAgICAgICAgICAgcGFyZW50LnNwYWNlX2xlZnQgLT0gcmVjdC5oZWlnaHQgKyBwYWNraW5nT3B0aW9ucy5QQURESU5HO1xyXG4gICAgICAgICAgICBwYXJlbnQuYm90dG9tICs9IHJlY3QuaGVpZ2h0ICsgcGFja2luZ09wdGlvbnMuUEFERElORztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IGdsb2JhbF9ib3R0b207XHJcbiAgICAgICAgICAgIGdsb2JhbF9ib3R0b20gKz0gcmVjdC5oZWlnaHQgKyBwYWNraW5nT3B0aW9ucy5QQURESU5HO1xyXG4gICAgICAgICAgICByZWN0LnggPSBpbml0X3g7XHJcbiAgICAgICAgICAgIHJlY3QuYm90dG9tID0gcmVjdC55O1xyXG4gICAgICAgICAgICByZWN0LnNwYWNlX2xlZnQgPSByZWN0LmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlY3QueSArIHJlY3QuaGVpZ2h0IC0gcmVhbF9oZWlnaHQgPiAtcGFja2luZ09wdGlvbnMuRkxPQVRfRVBTSUxPTilcclxuICAgICAgICAgICAgcmVhbF9oZWlnaHQgPSByZWN0LnkgKyByZWN0LmhlaWdodCAtIGluaXRfeTtcclxuICAgICAgICBpZiAocmVjdC54ICsgcmVjdC53aWR0aCAtIHJlYWxfd2lkdGggPiAtcGFja2luZ09wdGlvbnMuRkxPQVRfRVBTSUxPTilcclxuICAgICAgICAgICAgcmVhbF93aWR0aCA9IHJlY3QueCArIHJlY3Qud2lkdGggLSBpbml0X3g7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBmdW5jdGlvbiBnZXRfZW50aXJlX3dpZHRoKGRhdGEpIHtcclxuICAgICAgICB2YXIgd2lkdGggPSAwO1xyXG4gICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZCkgeyByZXR1cm4gd2lkdGggKz0gZC53aWR0aCArIHBhY2tpbmdPcHRpb25zLlBBRERJTkc7IH0pO1xyXG4gICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldF9yZWFsX3JhdGlvKCkge1xyXG4gICAgICAgIHJldHVybiAocmVhbF93aWR0aCAvIHJlYWxfaGVpZ2h0KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmFwcGx5UGFja2luZyA9IGFwcGx5UGFja2luZztcclxuZnVuY3Rpb24gc2VwYXJhdGVHcmFwaHMobm9kZXMsIGxpbmtzKSB7XHJcbiAgICB2YXIgbWFya3MgPSB7fTtcclxuICAgIHZhciB3YXlzID0ge307XHJcbiAgICB2YXIgZ3JhcGhzID0gW107XHJcbiAgICB2YXIgY2x1c3RlcnMgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBsaW5rID0gbGlua3NbaV07XHJcbiAgICAgICAgdmFyIG4xID0gbGluay5zb3VyY2U7XHJcbiAgICAgICAgdmFyIG4yID0gbGluay50YXJnZXQ7XHJcbiAgICAgICAgaWYgKHdheXNbbjEuaW5kZXhdKVxyXG4gICAgICAgICAgICB3YXlzW24xLmluZGV4XS5wdXNoKG4yKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHdheXNbbjEuaW5kZXhdID0gW24yXTtcclxuICAgICAgICBpZiAod2F5c1tuMi5pbmRleF0pXHJcbiAgICAgICAgICAgIHdheXNbbjIuaW5kZXhdLnB1c2gobjEpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgd2F5c1tuMi5pbmRleF0gPSBbbjFdO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG1hcmtzW25vZGUuaW5kZXhdKVxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICBleHBsb3JlX25vZGUobm9kZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBleHBsb3JlX25vZGUobiwgaXNfbmV3KSB7XHJcbiAgICAgICAgaWYgKG1hcmtzW24uaW5kZXhdICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoaXNfbmV3KSB7XHJcbiAgICAgICAgICAgIGNsdXN0ZXJzKys7XHJcbiAgICAgICAgICAgIGdyYXBocy5wdXNoKHsgYXJyYXk6IFtdIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXJrc1tuLmluZGV4XSA9IGNsdXN0ZXJzO1xyXG4gICAgICAgIGdyYXBoc1tjbHVzdGVycyAtIDFdLmFycmF5LnB1c2gobik7XHJcbiAgICAgICAgdmFyIGFkamFjZW50ID0gd2F5c1tuLmluZGV4XTtcclxuICAgICAgICBpZiAoIWFkamFjZW50KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhZGphY2VudC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBleHBsb3JlX25vZGUoYWRqYWNlbnRbal0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ3JhcGhzO1xyXG59XHJcbmV4cG9ydHMuc2VwYXJhdGVHcmFwaHMgPSBzZXBhcmF0ZUdyYXBocztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGFuZGxlZGlzY29ubmVjdGVkLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBwb3dlcmdyYXBoID0gcmVxdWlyZShcIi4vcG93ZXJncmFwaFwiKTtcclxudmFyIGxpbmtsZW5ndGhzXzEgPSByZXF1aXJlKFwiLi9saW5rbGVuZ3Roc1wiKTtcclxudmFyIGRlc2NlbnRfMSA9IHJlcXVpcmUoXCIuL2Rlc2NlbnRcIik7XHJcbnZhciByZWN0YW5nbGVfMSA9IHJlcXVpcmUoXCIuL3JlY3RhbmdsZVwiKTtcclxudmFyIHNob3J0ZXN0cGF0aHNfMSA9IHJlcXVpcmUoXCIuL3Nob3J0ZXN0cGF0aHNcIik7XHJcbnZhciBnZW9tXzEgPSByZXF1aXJlKFwiLi9nZW9tXCIpO1xyXG52YXIgaGFuZGxlZGlzY29ubmVjdGVkXzEgPSByZXF1aXJlKFwiLi9oYW5kbGVkaXNjb25uZWN0ZWRcIik7XHJcbnZhciBFdmVudFR5cGU7XHJcbihmdW5jdGlvbiAoRXZlbnRUeXBlKSB7XHJcbiAgICBFdmVudFR5cGVbRXZlbnRUeXBlW1wic3RhcnRcIl0gPSAwXSA9IFwic3RhcnRcIjtcclxuICAgIEV2ZW50VHlwZVtFdmVudFR5cGVbXCJ0aWNrXCJdID0gMV0gPSBcInRpY2tcIjtcclxuICAgIEV2ZW50VHlwZVtFdmVudFR5cGVbXCJlbmRcIl0gPSAyXSA9IFwiZW5kXCI7XHJcbn0pKEV2ZW50VHlwZSA9IGV4cG9ydHMuRXZlbnRUeXBlIHx8IChleHBvcnRzLkV2ZW50VHlwZSA9IHt9KSk7XHJcbjtcclxuZnVuY3Rpb24gaXNHcm91cChnKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGcubGVhdmVzICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZy5ncm91cHMgIT09ICd1bmRlZmluZWQnO1xyXG59XHJcbnZhciBMYXlvdXQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGF5b3V0KCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5fY2FudmFzU2l6ZSA9IFsxLCAxXTtcclxuICAgICAgICB0aGlzLl9saW5rRGlzdGFuY2UgPSAyMDtcclxuICAgICAgICB0aGlzLl9kZWZhdWx0Tm9kZVNpemUgPSAxMDtcclxuICAgICAgICB0aGlzLl9saW5rTGVuZ3RoQ2FsY3VsYXRvciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGlua1R5cGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2F2b2lkT3ZlcmxhcHMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVEaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9ub2RlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2dyb3VwcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Jvb3RHcm91cCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGlua3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9jb25zdHJhaW50cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2Rpc3RhbmNlTWF0cml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kZXNjZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kaXJlY3RlZExpbmtDb25zdHJhaW50cyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fdGhyZXNob2xkID0gMC4wMTtcclxuICAgICAgICB0aGlzLl92aXNpYmlsaXR5R3JhcGggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2dyb3VwQ29tcGFjdG5lc3MgPSAxZS02O1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubGlua0FjY2Vzc29yID0ge1xyXG4gICAgICAgICAgICBnZXRTb3VyY2VJbmRleDogTGF5b3V0LmdldFNvdXJjZUluZGV4LFxyXG4gICAgICAgICAgICBnZXRUYXJnZXRJbmRleDogTGF5b3V0LmdldFRhcmdldEluZGV4LFxyXG4gICAgICAgICAgICBzZXRMZW5ndGg6IExheW91dC5zZXRMaW5rTGVuZ3RoLFxyXG4gICAgICAgICAgICBnZXRUeXBlOiBmdW5jdGlvbiAobCkgeyByZXR1cm4gdHlwZW9mIF90aGlzLl9saW5rVHlwZSA9PT0gXCJmdW5jdGlvblwiID8gX3RoaXMuX2xpbmtUeXBlKGwpIDogMDsgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50KVxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50ID0ge307XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50W0V2ZW50VHlwZVtlXV0gPSBsaXN0ZW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRbZV0gPSBsaXN0ZW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAodGhpcy5ldmVudCAmJiB0eXBlb2YgdGhpcy5ldmVudFtlLnR5cGVdICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50W2UudHlwZV0oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUua2ljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB3aGlsZSAoIXRoaXMudGljaygpKVxyXG4gICAgICAgICAgICA7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9hbHBoYSA8IHRoaXMuX3RocmVzaG9sZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9ydW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih7IHR5cGU6IEV2ZW50VHlwZS5lbmQsIGFscGhhOiB0aGlzLl9hbHBoYSA9IDAsIHN0cmVzczogdGhpcy5fbGFzdFN0cmVzcyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuID0gdGhpcy5fbm9kZXMubGVuZ3RoLCBtID0gdGhpcy5fbGlua3MubGVuZ3RoO1xyXG4gICAgICAgIHZhciBvLCBpO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQubG9ja3MuY2xlYXIoKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIG8gPSB0aGlzLl9ub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKG8uZml4ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygby5weCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG8ucHkgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgby5weCA9IG8ueDtcclxuICAgICAgICAgICAgICAgICAgICBvLnB5ID0gby55O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBbby5weCwgby5weV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZXNjZW50LmxvY2tzLmFkZChpLCBwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgczEgPSB0aGlzLl9kZXNjZW50LnJ1bmdlS3V0dGEoKTtcclxuICAgICAgICBpZiAoczEgPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYWxwaGEgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5fbGFzdFN0cmVzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5fYWxwaGEgPSBzMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGFzdFN0cmVzcyA9IHMxO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTm9kZVBvc2l0aW9ucygpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcih7IHR5cGU6IEV2ZW50VHlwZS50aWNrLCBhbHBoYTogdGhpcy5fYWxwaGEsIHN0cmVzczogdGhpcy5fbGFzdFN0cmVzcyB9KTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS51cGRhdGVOb2RlUG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fZGVzY2VudC54WzBdLCB5ID0gdGhpcy5fZGVzY2VudC54WzFdO1xyXG4gICAgICAgIHZhciBvLCBpID0gdGhpcy5fbm9kZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgbyA9IHRoaXMuX25vZGVzW2ldO1xyXG4gICAgICAgICAgICBvLnggPSB4W2ldO1xyXG4gICAgICAgICAgICBvLnkgPSB5W2ldO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLm5vZGVzID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICBpZiAoIXYpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX25vZGVzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9saW5rcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbiA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IE1hdGgubWF4KG4sIGwuc291cmNlLCBsLnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vZGVzID0gbmV3IEFycmF5KCsrbik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vZGVzW2ldID0ge307XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25vZGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ub2RlcyA9IHY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5ncm91cHMgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF4KVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ3JvdXBzO1xyXG4gICAgICAgIHRoaXMuX2dyb3VwcyA9IHg7XHJcbiAgICAgICAgdGhpcy5fcm9vdEdyb3VwID0ge307XHJcbiAgICAgICAgdGhpcy5fZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBnLnBhZGRpbmcgPT09IFwidW5kZWZpbmVkXCIpXHJcbiAgICAgICAgICAgICAgICBnLnBhZGRpbmcgPSAxO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGcubGVhdmVzICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBnLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGcubGVhdmVzW2ldID0gX3RoaXMuX25vZGVzW3ZdKS5wYXJlbnQgPSBnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBnLmdyb3VwcyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgZy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZ2ksIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGdpID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGcuZ3JvdXBzW2ldID0gX3RoaXMuX2dyb3Vwc1tnaV0pLnBhcmVudCA9IGc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3Jvb3RHcm91cC5sZWF2ZXMgPSB0aGlzLl9ub2Rlcy5maWx0ZXIoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHR5cGVvZiB2LnBhcmVudCA9PT0gJ3VuZGVmaW5lZCc7IH0pO1xyXG4gICAgICAgIHRoaXMuX3Jvb3RHcm91cC5ncm91cHMgPSB0aGlzLl9ncm91cHMuZmlsdGVyKGZ1bmN0aW9uIChnKSB7IHJldHVybiB0eXBlb2YgZy5wYXJlbnQgPT09ICd1bmRlZmluZWQnOyB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnBvd2VyR3JhcGhHcm91cHMgPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIHZhciBnID0gcG93ZXJncmFwaC5nZXRHcm91cHModGhpcy5fbm9kZXMsIHRoaXMuX2xpbmtzLCB0aGlzLmxpbmtBY2Nlc3NvciwgdGhpcy5fcm9vdEdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwcyhnLmdyb3Vwcyk7XHJcbiAgICAgICAgZihnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmF2b2lkT3ZlcmxhcHMgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2F2b2lkT3ZlcmxhcHM7XHJcbiAgICAgICAgdGhpcy5fYXZvaWRPdmVybGFwcyA9IHY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5oYW5kbGVEaXNjb25uZWN0ZWQgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZURpc2Nvbm5lY3RlZDtcclxuICAgICAgICB0aGlzLl9oYW5kbGVEaXNjb25uZWN0ZWQgPSB2O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZmxvd0xheW91dCA9IGZ1bmN0aW9uIChheGlzLCBtaW5TZXBhcmF0aW9uKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICBheGlzID0gJ3knO1xyXG4gICAgICAgIHRoaXMuX2RpcmVjdGVkTGlua0NvbnN0cmFpbnRzID0ge1xyXG4gICAgICAgICAgICBheGlzOiBheGlzLFxyXG4gICAgICAgICAgICBnZXRNaW5TZXBhcmF0aW9uOiB0eXBlb2YgbWluU2VwYXJhdGlvbiA9PT0gJ251bWJlcicgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBtaW5TZXBhcmF0aW9uOyB9IDogbWluU2VwYXJhdGlvblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5saW5rcyA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGlua3M7XHJcbiAgICAgICAgdGhpcy5fbGlua3MgPSB4O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuY29uc3RyYWludHMgPSBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnRzO1xyXG4gICAgICAgIHRoaXMuX2NvbnN0cmFpbnRzID0gYztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmRpc3RhbmNlTWF0cml4ID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kaXN0YW5jZU1hdHJpeDtcclxuICAgICAgICB0aGlzLl9kaXN0YW5jZU1hdHJpeCA9IGQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIXgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYW52YXNTaXplO1xyXG4gICAgICAgIHRoaXMuX2NhbnZhc1NpemUgPSB4O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZGVmYXVsdE5vZGVTaXplID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIXgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWZhdWx0Tm9kZVNpemU7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdE5vZGVTaXplID0geDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmdyb3VwQ29tcGFjdG5lc3MgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICgheClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dyb3VwQ29tcGFjdG5lc3M7XHJcbiAgICAgICAgdGhpcy5fZ3JvdXBDb21wYWN0bmVzcyA9IHg7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5saW5rRGlzdGFuY2UgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICgheCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGlua0Rpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9saW5rRGlzdGFuY2UgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6ICt4O1xyXG4gICAgICAgIHRoaXMuX2xpbmtMZW5ndGhDYWxjdWxhdG9yID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmxpbmtUeXBlID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB0aGlzLl9saW5rVHlwZSA9IGY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5jb252ZXJnZW5jZVRocmVzaG9sZCA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCF4KVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGhyZXNob2xkO1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZCA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogK3g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5hbHBoYSA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWxwaGE7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHggPSAreDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2FscGhhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxwaGEgPSB4O1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FscGhhID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9ydW5uaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVubmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKHsgdHlwZTogRXZlbnRUeXBlLnN0YXJ0LCBhbHBoYTogdGhpcy5fYWxwaGEgPSB4IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2ljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmdldExpbmtMZW5ndGggPSBmdW5jdGlvbiAobGluaykge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5fbGlua0Rpc3RhbmNlID09PSBcImZ1bmN0aW9uXCIgPyArKHRoaXMuX2xpbmtEaXN0YW5jZShsaW5rKSkgOiB0aGlzLl9saW5rRGlzdGFuY2U7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnNldExpbmtMZW5ndGggPSBmdW5jdGlvbiAobGluaywgbGVuZ3RoKSB7XHJcbiAgICAgICAgbGluay5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5nZXRMaW5rVHlwZSA9IGZ1bmN0aW9uIChsaW5rKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLl9saW5rVHlwZSA9PT0gXCJmdW5jdGlvblwiID8gdGhpcy5fbGlua1R5cGUobGluaykgOiAwO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzID0gZnVuY3Rpb24gKGlkZWFsTGVuZ3RoLCB3KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodyA9PT0gdm9pZCAwKSB7IHcgPSAxOyB9XHJcbiAgICAgICAgdGhpcy5saW5rRGlzdGFuY2UoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGlkZWFsTGVuZ3RoICogbC5sZW5ndGg7IH0pO1xyXG4gICAgICAgIHRoaXMuX2xpbmtMZW5ndGhDYWxjdWxhdG9yID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbGlua2xlbmd0aHNfMS5zeW1tZXRyaWNEaWZmTGlua0xlbmd0aHMoX3RoaXMuX2xpbmtzLCBfdGhpcy5saW5rQWNjZXNzb3IsIHcpOyB9O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuamFjY2FyZExpbmtMZW5ndGhzID0gZnVuY3Rpb24gKGlkZWFsTGVuZ3RoLCB3KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodyA9PT0gdm9pZCAwKSB7IHcgPSAxOyB9XHJcbiAgICAgICAgdGhpcy5saW5rRGlzdGFuY2UoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGlkZWFsTGVuZ3RoICogbC5sZW5ndGg7IH0pO1xyXG4gICAgICAgIHRoaXMuX2xpbmtMZW5ndGhDYWxjdWxhdG9yID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbGlua2xlbmd0aHNfMS5qYWNjYXJkTGlua0xlbmd0aHMoX3RoaXMuX2xpbmtzLCBfdGhpcy5saW5rQWNjZXNzb3IsIHcpOyB9O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoaW5pdGlhbFVuY29uc3RyYWluZWRJdGVyYXRpb25zLCBpbml0aWFsVXNlckNvbnN0cmFpbnRJdGVyYXRpb25zLCBpbml0aWFsQWxsQ29uc3RyYWludHNJdGVyYXRpb25zLCBncmlkU25hcEl0ZXJhdGlvbnMsIGtlZXBSdW5uaW5nKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAoaW5pdGlhbFVuY29uc3RyYWluZWRJdGVyYXRpb25zID09PSB2b2lkIDApIHsgaW5pdGlhbFVuY29uc3RyYWluZWRJdGVyYXRpb25zID0gMDsgfVxyXG4gICAgICAgIGlmIChpbml0aWFsVXNlckNvbnN0cmFpbnRJdGVyYXRpb25zID09PSB2b2lkIDApIHsgaW5pdGlhbFVzZXJDb25zdHJhaW50SXRlcmF0aW9ucyA9IDA7IH1cclxuICAgICAgICBpZiAoaW5pdGlhbEFsbENvbnN0cmFpbnRzSXRlcmF0aW9ucyA9PT0gdm9pZCAwKSB7IGluaXRpYWxBbGxDb25zdHJhaW50c0l0ZXJhdGlvbnMgPSAwOyB9XHJcbiAgICAgICAgaWYgKGdyaWRTbmFwSXRlcmF0aW9ucyA9PT0gdm9pZCAwKSB7IGdyaWRTbmFwSXRlcmF0aW9ucyA9IDA7IH1cclxuICAgICAgICBpZiAoa2VlcFJ1bm5pbmcgPT09IHZvaWQgMCkgeyBrZWVwUnVubmluZyA9IHRydWU7IH1cclxuICAgICAgICB2YXIgaSwgaiwgbiA9IHRoaXMubm9kZXMoKS5sZW5ndGgsIE4gPSBuICsgMiAqIHRoaXMuX2dyb3Vwcy5sZW5ndGgsIG0gPSB0aGlzLl9saW5rcy5sZW5ndGgsIHcgPSB0aGlzLl9jYW52YXNTaXplWzBdLCBoID0gdGhpcy5fY2FudmFzU2l6ZVsxXTtcclxuICAgICAgICB2YXIgeCA9IG5ldyBBcnJheShOKSwgeSA9IG5ldyBBcnJheShOKTtcclxuICAgICAgICB2YXIgRyA9IG51bGw7XHJcbiAgICAgICAgdmFyIGFvID0gdGhpcy5fYXZvaWRPdmVybGFwcztcclxuICAgICAgICB0aGlzLl9ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgIHYuaW5kZXggPSBpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYueCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHYueCA9IHcgLyAyLCB2LnkgPSBoIC8gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4W2ldID0gdi54LCB5W2ldID0gdi55O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLl9saW5rTGVuZ3RoQ2FsY3VsYXRvcilcclxuICAgICAgICAgICAgdGhpcy5fbGlua0xlbmd0aENhbGN1bGF0b3IoKTtcclxuICAgICAgICB2YXIgZGlzdGFuY2VzO1xyXG4gICAgICAgIGlmICh0aGlzLl9kaXN0YW5jZU1hdHJpeCkge1xyXG4gICAgICAgICAgICBkaXN0YW5jZXMgPSB0aGlzLl9kaXN0YW5jZU1hdHJpeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRpc3RhbmNlcyA9IChuZXcgc2hvcnRlc3RwYXRoc18xLkNhbGN1bGF0b3IoTiwgdGhpcy5fbGlua3MsIExheW91dC5nZXRTb3VyY2VJbmRleCwgTGF5b3V0LmdldFRhcmdldEluZGV4LCBmdW5jdGlvbiAobCkgeyByZXR1cm4gX3RoaXMuZ2V0TGlua0xlbmd0aChsKTsgfSkpLkRpc3RhbmNlTWF0cml4KCk7XHJcbiAgICAgICAgICAgIEcgPSBkZXNjZW50XzEuRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXgoTiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gMjsgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpbmtzLmZvckVhY2goZnVuY3Rpb24gKGwpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbC5zb3VyY2UgPT0gXCJudW1iZXJcIilcclxuICAgICAgICAgICAgICAgICAgICBsLnNvdXJjZSA9IF90aGlzLl9ub2Rlc1tsLnNvdXJjZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGwudGFyZ2V0ID09IFwibnVtYmVyXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgbC50YXJnZXQgPSBfdGhpcy5fbm9kZXNbbC50YXJnZXRdO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fbGlua3MuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHUgPSBMYXlvdXQuZ2V0U291cmNlSW5kZXgoZSksIHYgPSBMYXlvdXQuZ2V0VGFyZ2V0SW5kZXgoZSk7XHJcbiAgICAgICAgICAgICAgICBHW3VdW3ZdID0gR1t2XVt1XSA9IGUud2VpZ2h0IHx8IDE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgRCA9IGRlc2NlbnRfMS5EZXNjZW50LmNyZWF0ZVNxdWFyZU1hdHJpeChOLCBmdW5jdGlvbiAoaSwgaikge1xyXG4gICAgICAgICAgICByZXR1cm4gZGlzdGFuY2VzW2ldW2pdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLl9yb290R3JvdXAgJiYgdHlwZW9mIHRoaXMuX3Jvb3RHcm91cC5ncm91cHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gbjtcclxuICAgICAgICAgICAgdmFyIGFkZEF0dHJhY3Rpb24gPSBmdW5jdGlvbiAoaSwgaiwgc3RyZW5ndGgsIGlkZWFsRGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIEdbaV1bal0gPSBHW2pdW2ldID0gc3RyZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBEW2ldW2pdID0gRFtqXVtpXSA9IGlkZWFsRGlzdGFuY2U7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgICAgICBhZGRBdHRyYWN0aW9uKGksIGkgKyAxLCBfdGhpcy5fZ3JvdXBDb21wYWN0bmVzcywgMC4xKTtcclxuICAgICAgICAgICAgICAgIHhbaV0gPSAwLCB5W2krK10gPSAwO1xyXG4gICAgICAgICAgICAgICAgeFtpXSA9IDAsIHlbaSsrXSA9IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3RHcm91cCA9IHsgbGVhdmVzOiB0aGlzLl9ub2RlcywgZ3JvdXBzOiBbXSB9O1xyXG4gICAgICAgIHZhciBjdXJDb25zdHJhaW50cyA9IHRoaXMuX2NvbnN0cmFpbnRzIHx8IFtdO1xyXG4gICAgICAgIGlmICh0aGlzLl9kaXJlY3RlZExpbmtDb25zdHJhaW50cykge1xyXG4gICAgICAgICAgICB0aGlzLmxpbmtBY2Nlc3Nvci5nZXRNaW5TZXBhcmF0aW9uID0gdGhpcy5fZGlyZWN0ZWRMaW5rQ29uc3RyYWludHMuZ2V0TWluU2VwYXJhdGlvbjtcclxuICAgICAgICAgICAgY3VyQ29uc3RyYWludHMgPSBjdXJDb25zdHJhaW50cy5jb25jYXQobGlua2xlbmd0aHNfMS5nZW5lcmF0ZURpcmVjdGVkRWRnZUNvbnN0cmFpbnRzKG4sIHRoaXMuX2xpbmtzLCB0aGlzLl9kaXJlY3RlZExpbmtDb25zdHJhaW50cy5heGlzLCAodGhpcy5saW5rQWNjZXNzb3IpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYXZvaWRPdmVybGFwcyhmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudCA9IG5ldyBkZXNjZW50XzEuRGVzY2VudChbeCwgeV0sIEQpO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQubG9ja3MuY2xlYXIoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuX25vZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoby5maXhlZCkge1xyXG4gICAgICAgICAgICAgICAgby5weCA9IG8ueDtcclxuICAgICAgICAgICAgICAgIG8ucHkgPSBvLnk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcCA9IFtvLngsIG8ueV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZXNjZW50LmxvY2tzLmFkZChpLCBwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kZXNjZW50LnRocmVzaG9sZCA9IHRoaXMuX3RocmVzaG9sZDtcclxuICAgICAgICB0aGlzLmluaXRpYWxMYXlvdXQoaW5pdGlhbFVuY29uc3RyYWluZWRJdGVyYXRpb25zLCB4LCB5KTtcclxuICAgICAgICBpZiAoY3VyQ29uc3RyYWludHMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5wcm9qZWN0ID0gbmV3IHJlY3RhbmdsZV8xLlByb2plY3Rpb24odGhpcy5fbm9kZXMsIHRoaXMuX2dyb3VwcywgdGhpcy5fcm9vdEdyb3VwLCBjdXJDb25zdHJhaW50cykucHJvamVjdEZ1bmN0aW9ucygpO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQucnVuKGluaXRpYWxVc2VyQ29uc3RyYWludEl0ZXJhdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuc2VwYXJhdGVPdmVybGFwcGluZ0NvbXBvbmVudHModywgaCk7XHJcbiAgICAgICAgdGhpcy5hdm9pZE92ZXJsYXBzKGFvKTtcclxuICAgICAgICBpZiAoYW8pIHtcclxuICAgICAgICAgICAgdGhpcy5fbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyB2LnggPSB4W2ldLCB2LnkgPSB5W2ldOyB9KTtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5wcm9qZWN0ID0gbmV3IHJlY3RhbmdsZV8xLlByb2plY3Rpb24odGhpcy5fbm9kZXMsIHRoaXMuX2dyb3VwcywgdGhpcy5fcm9vdEdyb3VwLCBjdXJDb25zdHJhaW50cywgdHJ1ZSkucHJvamVjdEZ1bmN0aW9ucygpO1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHhbaV0gPSB2LngsIHlbaV0gPSB2Lnk7IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kZXNjZW50LkcgPSBHO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQucnVuKGluaXRpYWxBbGxDb25zdHJhaW50c0l0ZXJhdGlvbnMpO1xyXG4gICAgICAgIGlmIChncmlkU25hcEl0ZXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5zbmFwU3RyZW5ndGggPSAxMDAwO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnNuYXBHcmlkU2l6ZSA9IHRoaXMuX25vZGVzWzBdLndpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50Lm51bUdyaWRTbmFwTm9kZXMgPSBuO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnNjYWxlU25hcEJ5TWF4SCA9IG4gIT0gTjtcclxuICAgICAgICAgICAgdmFyIEcwID0gZGVzY2VudF8xLkRlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4KE4sIGZ1bmN0aW9uIChpLCBqKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA+PSBuIHx8IGogPj0gbilcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gR1tpXVtqXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5HID0gRzA7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQucnVuKGdyaWRTbmFwSXRlcmF0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlTm9kZVBvc2l0aW9ucygpO1xyXG4gICAgICAgIHRoaXMuc2VwYXJhdGVPdmVybGFwcGluZ0NvbXBvbmVudHModywgaCk7XHJcbiAgICAgICAgcmV0dXJuIGtlZXBSdW5uaW5nID8gdGhpcy5yZXN1bWUoKSA6IHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5pbml0aWFsTGF5b3V0ID0gZnVuY3Rpb24gKGl0ZXJhdGlvbnMsIHgsIHkpIHtcclxuICAgICAgICBpZiAodGhpcy5fZ3JvdXBzLmxlbmd0aCA+IDAgJiYgaXRlcmF0aW9ucyA+IDApIHtcclxuICAgICAgICAgICAgdmFyIG4gPSB0aGlzLl9ub2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBlZGdlcyA9IHRoaXMuX2xpbmtzLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gKHsgc291cmNlOiBlLnNvdXJjZS5pbmRleCwgdGFyZ2V0OiBlLnRhcmdldC5pbmRleCB9KTsgfSk7XHJcbiAgICAgICAgICAgIHZhciB2cyA9IHRoaXMuX25vZGVzLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gKHsgaW5kZXg6IHYuaW5kZXggfSk7IH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZywgaSkge1xyXG4gICAgICAgICAgICAgICAgdnMucHVzaCh7IGluZGV4OiBnLmluZGV4ID0gbiArIGkgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZywgaSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgZy5sZWF2ZXMuZm9yRWFjaChmdW5jdGlvbiAodikgeyByZXR1cm4gZWRnZXMucHVzaCh7IHNvdXJjZTogZy5pbmRleCwgdGFyZ2V0OiB2LmluZGV4IH0pOyB9KTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZy5ncm91cHMgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICAgICAgICAgIGcuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGdnKSB7IHJldHVybiBlZGdlcy5wdXNoKHsgc291cmNlOiBnLmluZGV4LCB0YXJnZXQ6IGdnLmluZGV4IH0pOyB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5ldyBMYXlvdXQoKVxyXG4gICAgICAgICAgICAgICAgLnNpemUodGhpcy5zaXplKCkpXHJcbiAgICAgICAgICAgICAgICAubm9kZXModnMpXHJcbiAgICAgICAgICAgICAgICAubGlua3MoZWRnZXMpXHJcbiAgICAgICAgICAgICAgICAuYXZvaWRPdmVybGFwcyhmYWxzZSlcclxuICAgICAgICAgICAgICAgIC5saW5rRGlzdGFuY2UodGhpcy5saW5rRGlzdGFuY2UoKSlcclxuICAgICAgICAgICAgICAgIC5zeW1tZXRyaWNEaWZmTGlua0xlbmd0aHMoNSlcclxuICAgICAgICAgICAgICAgIC5jb252ZXJnZW5jZVRocmVzaG9sZCgxZS00KVxyXG4gICAgICAgICAgICAgICAgLnN0YXJ0KGl0ZXJhdGlvbnMsIDAsIDAsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5fbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgeFt2LmluZGV4XSA9IHZzW3YuaW5kZXhdLng7XHJcbiAgICAgICAgICAgICAgICB5W3YuaW5kZXhdID0gdnNbdi5pbmRleF0ueTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnJ1bihpdGVyYXRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5zZXBhcmF0ZU92ZXJsYXBwaW5nQ29tcG9uZW50cyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuX2Rpc3RhbmNlTWF0cml4ICYmIHRoaXMuX2hhbmRsZURpc2Nvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICB2YXIgeF8xID0gdGhpcy5fZGVzY2VudC54WzBdLCB5XzEgPSB0aGlzLl9kZXNjZW50LnhbMV07XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgdi54ID0geF8xW2ldLCB2LnkgPSB5XzFbaV07IH0pO1xyXG4gICAgICAgICAgICB2YXIgZ3JhcGhzID0gaGFuZGxlZGlzY29ubmVjdGVkXzEuc2VwYXJhdGVHcmFwaHModGhpcy5fbm9kZXMsIHRoaXMuX2xpbmtzKTtcclxuICAgICAgICAgICAgaGFuZGxlZGlzY29ubmVjdGVkXzEuYXBwbHlQYWNraW5nKGdyYXBocywgd2lkdGgsIGhlaWdodCwgdGhpcy5fZGVmYXVsdE5vZGVTaXplKTtcclxuICAgICAgICAgICAgdGhpcy5fbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX2Rlc2NlbnQueFswXVtpXSA9IHYueCwgX3RoaXMuX2Rlc2NlbnQueFsxXVtpXSA9IHYueTtcclxuICAgICAgICAgICAgICAgIGlmICh2LmJvdW5kcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHYuYm91bmRzLnNldFhDZW50cmUodi54KTtcclxuICAgICAgICAgICAgICAgICAgICB2LmJvdW5kcy5zZXRZQ2VudHJlKHYueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSgwLjEpO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSgwKTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnByZXBhcmVFZGdlUm91dGluZyA9IGZ1bmN0aW9uIChub2RlTWFyZ2luKSB7XHJcbiAgICAgICAgaWYgKG5vZGVNYXJnaW4gPT09IHZvaWQgMCkgeyBub2RlTWFyZ2luID0gMDsgfVxyXG4gICAgICAgIHRoaXMuX3Zpc2liaWxpdHlHcmFwaCA9IG5ldyBnZW9tXzEuVGFuZ2VudFZpc2liaWxpdHlHcmFwaCh0aGlzLl9ub2Rlcy5tYXAoZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHYuYm91bmRzLmluZmxhdGUoLW5vZGVNYXJnaW4pLnZlcnRpY2VzKCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUucm91dGVFZGdlID0gZnVuY3Rpb24gKGVkZ2UsIGFoLCBkcmF3KSB7XHJcbiAgICAgICAgaWYgKGFoID09PSB2b2lkIDApIHsgYWggPSA1OyB9XHJcbiAgICAgICAgdmFyIGxpbmVEYXRhID0gW107XHJcbiAgICAgICAgdmFyIHZnMiA9IG5ldyBnZW9tXzEuVGFuZ2VudFZpc2liaWxpdHlHcmFwaCh0aGlzLl92aXNpYmlsaXR5R3JhcGguUCwgeyBWOiB0aGlzLl92aXNpYmlsaXR5R3JhcGguViwgRTogdGhpcy5fdmlzaWJpbGl0eUdyYXBoLkUgfSksIHBvcnQxID0geyB4OiBlZGdlLnNvdXJjZS54LCB5OiBlZGdlLnNvdXJjZS55IH0sIHBvcnQyID0geyB4OiBlZGdlLnRhcmdldC54LCB5OiBlZGdlLnRhcmdldC55IH0sIHN0YXJ0ID0gdmcyLmFkZFBvaW50KHBvcnQxLCBlZGdlLnNvdXJjZS5pbmRleCksIGVuZCA9IHZnMi5hZGRQb2ludChwb3J0MiwgZWRnZS50YXJnZXQuaW5kZXgpO1xyXG4gICAgICAgIHZnMi5hZGRFZGdlSWZWaXNpYmxlKHBvcnQxLCBwb3J0MiwgZWRnZS5zb3VyY2UuaW5kZXgsIGVkZ2UudGFyZ2V0LmluZGV4KTtcclxuICAgICAgICBpZiAodHlwZW9mIGRyYXcgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGRyYXcodmcyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNvdXJjZUluZCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZS5pZDsgfSwgdGFyZ2V0SW5kID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0LmlkOyB9LCBsZW5ndGggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGgoKTsgfSwgc3BDYWxjID0gbmV3IHNob3J0ZXN0cGF0aHNfMS5DYWxjdWxhdG9yKHZnMi5WLmxlbmd0aCwgdmcyLkUsIHNvdXJjZUluZCwgdGFyZ2V0SW5kLCBsZW5ndGgpLCBzaG9ydGVzdFBhdGggPSBzcENhbGMuUGF0aEZyb21Ob2RlVG9Ob2RlKHN0YXJ0LmlkLCBlbmQuaWQpO1xyXG4gICAgICAgIGlmIChzaG9ydGVzdFBhdGgubGVuZ3RoID09PSAxIHx8IHNob3J0ZXN0UGF0aC5sZW5ndGggPT09IHZnMi5WLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgcm91dGUgPSByZWN0YW5nbGVfMS5tYWtlRWRnZUJldHdlZW4oZWRnZS5zb3VyY2UuaW5uZXJCb3VuZHMsIGVkZ2UudGFyZ2V0LmlubmVyQm91bmRzLCBhaCk7XHJcbiAgICAgICAgICAgIGxpbmVEYXRhID0gW3JvdXRlLnNvdXJjZUludGVyc2VjdGlvbiwgcm91dGUuYXJyb3dTdGFydF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbiA9IHNob3J0ZXN0UGF0aC5sZW5ndGggLSAyLCBwID0gdmcyLlZbc2hvcnRlc3RQYXRoW25dXS5wLCBxID0gdmcyLlZbc2hvcnRlc3RQYXRoWzBdXS5wLCBsaW5lRGF0YSA9IFtlZGdlLnNvdXJjZS5pbm5lckJvdW5kcy5yYXlJbnRlcnNlY3Rpb24ocC54LCBwLnkpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IG47IGkgPj0gMDsgLS1pKVxyXG4gICAgICAgICAgICAgICAgbGluZURhdGEucHVzaCh2ZzIuVltzaG9ydGVzdFBhdGhbaV1dLnApO1xyXG4gICAgICAgICAgICBsaW5lRGF0YS5wdXNoKHJlY3RhbmdsZV8xLm1ha2VFZGdlVG8ocSwgZWRnZS50YXJnZXQuaW5uZXJCb3VuZHMsIGFoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaW5lRGF0YTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQuZ2V0U291cmNlSW5kZXggPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgZS5zb3VyY2UgPT09ICdudW1iZXInID8gZS5zb3VyY2UgOiBlLnNvdXJjZS5pbmRleDtcclxuICAgIH07XHJcbiAgICBMYXlvdXQuZ2V0VGFyZ2V0SW5kZXggPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgZS50YXJnZXQgPT09ICdudW1iZXInID8gZS50YXJnZXQgOiBlLnRhcmdldC5pbmRleDtcclxuICAgIH07XHJcbiAgICBMYXlvdXQubGlua0lkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICByZXR1cm4gTGF5b3V0LmdldFNvdXJjZUluZGV4KGUpICsgXCItXCIgKyBMYXlvdXQuZ2V0VGFyZ2V0SW5kZXgoZSk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmRyYWdTdGFydCA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgaWYgKGlzR3JvdXAoZCkpIHtcclxuICAgICAgICAgICAgTGF5b3V0LnN0b3JlT2Zmc2V0KGQsIExheW91dC5kcmFnT3JpZ2luKGQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIExheW91dC5zdG9wTm9kZShkKTtcclxuICAgICAgICAgICAgZC5maXhlZCB8PSAyO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQuc3RvcE5vZGUgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHYucHggPSB2Lng7XHJcbiAgICAgICAgdi5weSA9IHYueTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQuc3RvcmVPZmZzZXQgPSBmdW5jdGlvbiAoZCwgb3JpZ2luKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgZC5sZWF2ZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgdi5maXhlZCB8PSAyO1xyXG4gICAgICAgICAgICAgICAgTGF5b3V0LnN0b3BOb2RlKHYpO1xyXG4gICAgICAgICAgICAgICAgdi5fZHJhZ0dyb3VwT2Zmc2V0WCA9IHYueCAtIG9yaWdpbi54O1xyXG4gICAgICAgICAgICAgICAgdi5fZHJhZ0dyb3VwT2Zmc2V0WSA9IHYueSAtIG9yaWdpbi55O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgZC5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykgeyByZXR1cm4gTGF5b3V0LnN0b3JlT2Zmc2V0KGcsIG9yaWdpbik7IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQuZHJhZ09yaWdpbiA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgaWYgKGlzR3JvdXAoZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHg6IGQuYm91bmRzLmN4KCksXHJcbiAgICAgICAgICAgICAgICB5OiBkLmJvdW5kcy5jeSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmRyYWcgPSBmdW5jdGlvbiAoZCwgcG9zaXRpb24pIHtcclxuICAgICAgICBpZiAoaXNHcm91cChkKSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGQubGVhdmVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZC5sZWF2ZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgICAgIGQuYm91bmRzLnNldFhDZW50cmUocG9zaXRpb24ueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZC5ib3VuZHMuc2V0WUNlbnRyZShwb3NpdGlvbi55KTtcclxuICAgICAgICAgICAgICAgICAgICB2LnB4ID0gdi5fZHJhZ0dyb3VwT2Zmc2V0WCArIHBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5weSA9IHYuX2RyYWdHcm91cE9mZnNldFkgKyBwb3NpdGlvbi55O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGQuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHsgcmV0dXJuIExheW91dC5kcmFnKGcsIHBvc2l0aW9uKTsgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGQucHggPSBwb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBkLnB5ID0gcG9zaXRpb24ueTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmRyYWdFbmQgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmIChpc0dyb3VwKGQpKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZC5sZWF2ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBkLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTGF5b3V0LmRyYWdFbmQodik7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHYuX2RyYWdHcm91cE9mZnNldFg7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHYuX2RyYWdHcm91cE9mZnNldFk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGQuZ3JvdXBzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZC5ncm91cHMuZm9yRWFjaChMYXlvdXQuZHJhZ0VuZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGQuZml4ZWQgJj0gfjY7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5tb3VzZU92ZXIgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQuZml4ZWQgfD0gNDtcclxuICAgICAgICBkLnB4ID0gZC54LCBkLnB5ID0gZC55O1xyXG4gICAgfTtcclxuICAgIExheW91dC5tb3VzZU91dCA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5maXhlZCAmPSB+NDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTGF5b3V0O1xyXG59KCkpO1xyXG5leHBvcnRzLkxheW91dCA9IExheW91dDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGF5b3V0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBzaG9ydGVzdHBhdGhzXzEgPSByZXF1aXJlKFwiLi9zaG9ydGVzdHBhdGhzXCIpO1xyXG52YXIgZGVzY2VudF8xID0gcmVxdWlyZShcIi4vZGVzY2VudFwiKTtcclxudmFyIHJlY3RhbmdsZV8xID0gcmVxdWlyZShcIi4vcmVjdGFuZ2xlXCIpO1xyXG52YXIgbGlua2xlbmd0aHNfMSA9IHJlcXVpcmUoXCIuL2xpbmtsZW5ndGhzXCIpO1xyXG52YXIgTGluazNEID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpbmszRChzb3VyY2UsIHRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgTGluazNELnByb3RvdHlwZS5hY3R1YWxMZW5ndGggPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh4LnJlZHVjZShmdW5jdGlvbiAoYywgdikge1xyXG4gICAgICAgICAgICB2YXIgZHggPSB2W190aGlzLnRhcmdldF0gLSB2W190aGlzLnNvdXJjZV07XHJcbiAgICAgICAgICAgIHJldHVybiBjICsgZHggKiBkeDtcclxuICAgICAgICB9LCAwKSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIExpbmszRDtcclxufSgpKTtcclxuZXhwb3J0cy5MaW5rM0QgPSBMaW5rM0Q7XHJcbnZhciBOb2RlM0QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm9kZTNEKHgsIHksIHopIHtcclxuICAgICAgICBpZiAoeCA9PT0gdm9pZCAwKSB7IHggPSAwOyB9XHJcbiAgICAgICAgaWYgKHkgPT09IHZvaWQgMCkgeyB5ID0gMDsgfVxyXG4gICAgICAgIGlmICh6ID09PSB2b2lkIDApIHsgeiA9IDA7IH1cclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuICAgIHJldHVybiBOb2RlM0Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTm9kZTNEID0gTm9kZTNEO1xyXG52YXIgTGF5b3V0M0QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGF5b3V0M0Qobm9kZXMsIGxpbmtzLCBpZGVhbExpbmtMZW5ndGgpIHtcclxuICAgICAgICBpZiAoaWRlYWxMaW5rTGVuZ3RoID09PSB2b2lkIDApIHsgaWRlYWxMaW5rTGVuZ3RoID0gMTsgfVxyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgICAgIHRoaXMubGlua3MgPSBsaW5rcztcclxuICAgICAgICB0aGlzLmlkZWFsTGlua0xlbmd0aCA9IGlkZWFsTGlua0xlbmd0aDtcclxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZUphY2NhcmRMaW5rTGVuZ3RocyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZXN1bHQgPSBuZXcgQXJyYXkoTGF5b3V0M0Quayk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBMYXlvdXQzRC5rOyArK2kpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHRbaV0gPSBuZXcgQXJyYXkobm9kZXMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gTGF5b3V0M0QuZGltczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBkaW0gPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZbZGltXSA9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgICAgICB2W2RpbV0gPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLnJlc3VsdFswXVtpXSA9IHYueDtcclxuICAgICAgICAgICAgX3RoaXMucmVzdWx0WzFdW2ldID0gdi55O1xyXG4gICAgICAgICAgICBfdGhpcy5yZXN1bHRbMl1baV0gPSB2Lno7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBMYXlvdXQzRC5wcm90b3R5cGUubGlua0xlbmd0aCA9IGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgcmV0dXJuIGwuYWN0dWFsTGVuZ3RoKHRoaXMucmVzdWx0KTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQzRC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoaXRlcmF0aW9ucykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnMgPT09IHZvaWQgMCkgeyBpdGVyYXRpb25zID0gMTAwOyB9XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLm5vZGVzLmxlbmd0aDtcclxuICAgICAgICB2YXIgbGlua0FjY2Vzc29yID0gbmV3IExpbmtBY2Nlc3NvcigpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZUphY2NhcmRMaW5rTGVuZ3RocylcclxuICAgICAgICAgICAgbGlua2xlbmd0aHNfMS5qYWNjYXJkTGlua0xlbmd0aHModGhpcy5saW5rcywgbGlua0FjY2Vzc29yLCAxLjUpO1xyXG4gICAgICAgIHRoaXMubGlua3MuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGggKj0gX3RoaXMuaWRlYWxMaW5rTGVuZ3RoOyB9KTtcclxuICAgICAgICB2YXIgZGlzdGFuY2VNYXRyaXggPSAobmV3IHNob3J0ZXN0cGF0aHNfMS5DYWxjdWxhdG9yKG4sIHRoaXMubGlua3MsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZTsgfSwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0OyB9LCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGg7IH0pKS5EaXN0YW5jZU1hdHJpeCgpO1xyXG4gICAgICAgIHZhciBEID0gZGVzY2VudF8xLkRlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4KG4sIGZ1bmN0aW9uIChpLCBqKSB7IHJldHVybiBkaXN0YW5jZU1hdHJpeFtpXVtqXTsgfSk7XHJcbiAgICAgICAgdmFyIEcgPSBkZXNjZW50XzEuRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXgobiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gMjsgfSk7XHJcbiAgICAgICAgdGhpcy5saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgICAgICB2YXIgc291cmNlID0gX2Euc291cmNlLCB0YXJnZXQgPSBfYS50YXJnZXQ7XHJcbiAgICAgICAgICAgIHJldHVybiBHW3NvdXJjZV1bdGFyZ2V0XSA9IEdbdGFyZ2V0XVtzb3VyY2VdID0gMTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRlc2NlbnQgPSBuZXcgZGVzY2VudF8xLkRlc2NlbnQodGhpcy5yZXN1bHQsIEQpO1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC50aHJlc2hvbGQgPSAxZS0zO1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC5HID0gRztcclxuICAgICAgICBpZiAodGhpcy5jb25zdHJhaW50cylcclxuICAgICAgICAgICAgdGhpcy5kZXNjZW50LnByb2plY3QgPSBuZXcgcmVjdGFuZ2xlXzEuUHJvamVjdGlvbih0aGlzLm5vZGVzLCBudWxsLCBudWxsLCB0aGlzLmNvbnN0cmFpbnRzKS5wcm9qZWN0RnVuY3Rpb25zKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gdGhpcy5ub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHYuZml4ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzY2VudC5sb2Nrcy5hZGQoaSwgW3YueCwgdi55LCB2LnpdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlc2NlbnQucnVuKGl0ZXJhdGlvbnMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dDNELnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC5sb2Nrcy5jbGVhcigpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdiA9IHRoaXMubm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh2LmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2NlbnQubG9ja3MuYWRkKGksIFt2LngsIHYueSwgdi56XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzY2VudC5ydW5nZUt1dHRhKCk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0M0QuZGltcyA9IFsneCcsICd5JywgJ3onXTtcclxuICAgIExheW91dDNELmsgPSBMYXlvdXQzRC5kaW1zLmxlbmd0aDtcclxuICAgIHJldHVybiBMYXlvdXQzRDtcclxufSgpKTtcclxuZXhwb3J0cy5MYXlvdXQzRCA9IExheW91dDNEO1xyXG52YXIgTGlua0FjY2Vzc29yID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpbmtBY2Nlc3NvcigpIHtcclxuICAgIH1cclxuICAgIExpbmtBY2Nlc3Nvci5wcm90b3R5cGUuZ2V0U291cmNlSW5kZXggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zb3VyY2U7IH07XHJcbiAgICBMaW5rQWNjZXNzb3IucHJvdG90eXBlLmdldFRhcmdldEluZGV4ID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0OyB9O1xyXG4gICAgTGlua0FjY2Vzc29yLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGg7IH07XHJcbiAgICBMaW5rQWNjZXNzb3IucHJvdG90eXBlLnNldExlbmd0aCA9IGZ1bmN0aW9uIChlLCBsKSB7IGUubGVuZ3RoID0gbDsgfTtcclxuICAgIHJldHVybiBMaW5rQWNjZXNzb3I7XHJcbn0oKSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxheW91dDNkLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmZ1bmN0aW9uIHVuaW9uQ291bnQoYSwgYikge1xyXG4gICAgdmFyIHUgPSB7fTtcclxuICAgIGZvciAodmFyIGkgaW4gYSlcclxuICAgICAgICB1W2ldID0ge307XHJcbiAgICBmb3IgKHZhciBpIGluIGIpXHJcbiAgICAgICAgdVtpXSA9IHt9O1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHUpLmxlbmd0aDtcclxufVxyXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb25Db3VudChhLCBiKSB7XHJcbiAgICB2YXIgbiA9IDA7XHJcbiAgICBmb3IgKHZhciBpIGluIGEpXHJcbiAgICAgICAgaWYgKHR5cGVvZiBiW2ldICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgKytuO1xyXG4gICAgcmV0dXJuIG47XHJcbn1cclxuZnVuY3Rpb24gZ2V0TmVpZ2hib3VycyhsaW5rcywgbGEpIHtcclxuICAgIHZhciBuZWlnaGJvdXJzID0ge307XHJcbiAgICB2YXIgYWRkTmVpZ2hib3VycyA9IGZ1bmN0aW9uICh1LCB2KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuZWlnaGJvdXJzW3VdID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgbmVpZ2hib3Vyc1t1XSA9IHt9O1xyXG4gICAgICAgIG5laWdoYm91cnNbdV1bdl0gPSB7fTtcclxuICAgIH07XHJcbiAgICBsaW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIHUgPSBsYS5nZXRTb3VyY2VJbmRleChlKSwgdiA9IGxhLmdldFRhcmdldEluZGV4KGUpO1xyXG4gICAgICAgIGFkZE5laWdoYm91cnModSwgdik7XHJcbiAgICAgICAgYWRkTmVpZ2hib3Vycyh2LCB1KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5laWdoYm91cnM7XHJcbn1cclxuZnVuY3Rpb24gY29tcHV0ZUxpbmtMZW5ndGhzKGxpbmtzLCB3LCBmLCBsYSkge1xyXG4gICAgdmFyIG5laWdoYm91cnMgPSBnZXROZWlnaGJvdXJzKGxpbmtzLCBsYSk7XHJcbiAgICBsaW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgdmFyIGEgPSBuZWlnaGJvdXJzW2xhLmdldFNvdXJjZUluZGV4KGwpXTtcclxuICAgICAgICB2YXIgYiA9IG5laWdoYm91cnNbbGEuZ2V0VGFyZ2V0SW5kZXgobCldO1xyXG4gICAgICAgIGxhLnNldExlbmd0aChsLCAxICsgdyAqIGYoYSwgYikpO1xyXG4gICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzKGxpbmtzLCBsYSwgdykge1xyXG4gICAgaWYgKHcgPT09IHZvaWQgMCkgeyB3ID0gMTsgfVxyXG4gICAgY29tcHV0ZUxpbmtMZW5ndGhzKGxpbmtzLCB3LCBmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gTWF0aC5zcXJ0KHVuaW9uQ291bnQoYSwgYikgLSBpbnRlcnNlY3Rpb25Db3VudChhLCBiKSk7IH0sIGxhKTtcclxufVxyXG5leHBvcnRzLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3RocyA9IHN5bW1ldHJpY0RpZmZMaW5rTGVuZ3RocztcclxuZnVuY3Rpb24gamFjY2FyZExpbmtMZW5ndGhzKGxpbmtzLCBsYSwgdykge1xyXG4gICAgaWYgKHcgPT09IHZvaWQgMCkgeyB3ID0gMTsgfVxyXG4gICAgY29tcHV0ZUxpbmtMZW5ndGhzKGxpbmtzLCB3LCBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihPYmplY3Qua2V5cyhhKS5sZW5ndGgsIE9iamVjdC5rZXlzKGIpLmxlbmd0aCkgPCAxLjEgPyAwIDogaW50ZXJzZWN0aW9uQ291bnQoYSwgYikgLyB1bmlvbkNvdW50KGEsIGIpO1xyXG4gICAgfSwgbGEpO1xyXG59XHJcbmV4cG9ydHMuamFjY2FyZExpbmtMZW5ndGhzID0gamFjY2FyZExpbmtMZW5ndGhzO1xyXG5mdW5jdGlvbiBnZW5lcmF0ZURpcmVjdGVkRWRnZUNvbnN0cmFpbnRzKG4sIGxpbmtzLCBheGlzLCBsYSkge1xyXG4gICAgdmFyIGNvbXBvbmVudHMgPSBzdHJvbmdseUNvbm5lY3RlZENvbXBvbmVudHMobiwgbGlua3MsIGxhKTtcclxuICAgIHZhciBub2RlcyA9IHt9O1xyXG4gICAgY29tcG9uZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpKSB7XHJcbiAgICAgICAgcmV0dXJuIGMuZm9yRWFjaChmdW5jdGlvbiAodikgeyByZXR1cm4gbm9kZXNbdl0gPSBpOyB9KTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGNvbnN0cmFpbnRzID0gW107XHJcbiAgICBsaW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgdmFyIHVpID0gbGEuZ2V0U291cmNlSW5kZXgobCksIHZpID0gbGEuZ2V0VGFyZ2V0SW5kZXgobCksIHUgPSBub2Rlc1t1aV0sIHYgPSBub2Rlc1t2aV07XHJcbiAgICAgICAgaWYgKHUgIT09IHYpIHtcclxuICAgICAgICAgICAgY29uc3RyYWludHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBheGlzOiBheGlzLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogdWksXHJcbiAgICAgICAgICAgICAgICByaWdodDogdmksXHJcbiAgICAgICAgICAgICAgICBnYXA6IGxhLmdldE1pblNlcGFyYXRpb24obClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29uc3RyYWludHM7XHJcbn1cclxuZXhwb3J0cy5nZW5lcmF0ZURpcmVjdGVkRWRnZUNvbnN0cmFpbnRzID0gZ2VuZXJhdGVEaXJlY3RlZEVkZ2VDb25zdHJhaW50cztcclxuZnVuY3Rpb24gc3Ryb25nbHlDb25uZWN0ZWRDb21wb25lbnRzKG51bVZlcnRpY2VzLCBlZGdlcywgbGEpIHtcclxuICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgdmFyIGluZGV4ID0gMDtcclxuICAgIHZhciBzdGFjayA9IFtdO1xyXG4gICAgdmFyIGNvbXBvbmVudHMgPSBbXTtcclxuICAgIGZ1bmN0aW9uIHN0cm9uZ0Nvbm5lY3Qodikge1xyXG4gICAgICAgIHYuaW5kZXggPSB2Lmxvd2xpbmsgPSBpbmRleCsrO1xyXG4gICAgICAgIHN0YWNrLnB1c2godik7XHJcbiAgICAgICAgdi5vblN0YWNrID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdi5vdXQ7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gX2FbX2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHcuaW5kZXggPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJvbmdDb25uZWN0KHcpO1xyXG4gICAgICAgICAgICAgICAgdi5sb3dsaW5rID0gTWF0aC5taW4odi5sb3dsaW5rLCB3Lmxvd2xpbmspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHcub25TdGFjaykge1xyXG4gICAgICAgICAgICAgICAgdi5sb3dsaW5rID0gTWF0aC5taW4odi5sb3dsaW5rLCB3LmluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodi5sb3dsaW5rID09PSB2LmluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBbXTtcclxuICAgICAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdyA9IHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgdy5vblN0YWNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHVzaCh3KTtcclxuICAgICAgICAgICAgICAgIGlmICh3ID09PSB2KVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChjb21wb25lbnQubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LmlkOyB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1WZXJ0aWNlczsgaSsrKSB7XHJcbiAgICAgICAgbm9kZXMucHVzaCh7IGlkOiBpLCBvdXQ6IFtdIH0pO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBlZGdlc18xID0gZWRnZXM7IF9pIDwgZWRnZXNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICB2YXIgZSA9IGVkZ2VzXzFbX2ldO1xyXG4gICAgICAgIHZhciB2XzEgPSBub2Rlc1tsYS5nZXRTb3VyY2VJbmRleChlKV0sIHcgPSBub2Rlc1tsYS5nZXRUYXJnZXRJbmRleChlKV07XHJcbiAgICAgICAgdl8xLm91dC5wdXNoKHcpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgX2EgPSAwLCBub2Rlc18xID0gbm9kZXM7IF9hIDwgbm9kZXNfMS5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICB2YXIgdiA9IG5vZGVzXzFbX2FdO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygdi5pbmRleCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgIHN0cm9uZ0Nvbm5lY3Qodik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29tcG9uZW50cztcclxufVxyXG5leHBvcnRzLnN0cm9uZ2x5Q29ubmVjdGVkQ29tcG9uZW50cyA9IHN0cm9uZ2x5Q29ubmVjdGVkQ29tcG9uZW50cztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGlua2xlbmd0aHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFBvd2VyRWRnZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQb3dlckVkZ2Uoc291cmNlLCB0YXJnZXQsIHR5cGUpIHtcclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBvd2VyRWRnZTtcclxufSgpKTtcclxuZXhwb3J0cy5Qb3dlckVkZ2UgPSBQb3dlckVkZ2U7XHJcbnZhciBDb25maWd1cmF0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENvbmZpZ3VyYXRpb24obiwgZWRnZXMsIGxpbmtBY2Nlc3Nvciwgcm9vdEdyb3VwKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLmxpbmtBY2Nlc3NvciA9IGxpbmtBY2Nlc3NvcjtcclxuICAgICAgICB0aGlzLm1vZHVsZXMgPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgdGhpcy5yb290cyA9IFtdO1xyXG4gICAgICAgIGlmIChyb290R3JvdXApIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0TW9kdWxlc0Zyb21Hcm91cChyb290R3JvdXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yb290cy5wdXNoKG5ldyBNb2R1bGVTZXQoKSk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290c1swXS5hZGQodGhpcy5tb2R1bGVzW2ldID0gbmV3IE1vZHVsZShpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuUiA9IGVkZ2VzLmxlbmd0aDtcclxuICAgICAgICBlZGdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBzID0gX3RoaXMubW9kdWxlc1tsaW5rQWNjZXNzb3IuZ2V0U291cmNlSW5kZXgoZSldLCB0ID0gX3RoaXMubW9kdWxlc1tsaW5rQWNjZXNzb3IuZ2V0VGFyZ2V0SW5kZXgoZSldLCB0eXBlID0gbGlua0FjY2Vzc29yLmdldFR5cGUoZSk7XHJcbiAgICAgICAgICAgIHMub3V0Z29pbmcuYWRkKHR5cGUsIHQpO1xyXG4gICAgICAgICAgICB0LmluY29taW5nLmFkZCh0eXBlLCBzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmluaXRNb2R1bGVzRnJvbUdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XHJcbiAgICAgICAgdmFyIG1vZHVsZVNldCA9IG5ldyBNb2R1bGVTZXQoKTtcclxuICAgICAgICB0aGlzLnJvb3RzLnB1c2gobW9kdWxlU2V0KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3VwLmxlYXZlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IGdyb3VwLmxlYXZlc1tpXTtcclxuICAgICAgICAgICAgdmFyIG1vZHVsZSA9IG5ldyBNb2R1bGUobm9kZS5pZCk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kdWxlc1tub2RlLmlkXSA9IG1vZHVsZTtcclxuICAgICAgICAgICAgbW9kdWxlU2V0LmFkZChtb2R1bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZ3JvdXAuZ3JvdXBzKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZ3JvdXAuZ3JvdXBzLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBncm91cC5ncm91cHNbal07XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVmaW5pdGlvbiA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCAhPT0gXCJsZWF2ZXNcIiAmJiBwcm9wICE9PSBcImdyb3Vwc1wiICYmIGNoaWxkLmhhc093blByb3BlcnR5KHByb3ApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uW3Byb3BdID0gY2hpbGRbcHJvcF07XHJcbiAgICAgICAgICAgICAgICBtb2R1bGVTZXQuYWRkKG5ldyBNb2R1bGUoLTEgLSBqLCBuZXcgTGlua1NldHMoKSwgbmV3IExpbmtTZXRzKCksIHRoaXMuaW5pdE1vZHVsZXNGcm9tR3JvdXAoY2hpbGQpLCBkZWZpbml0aW9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1vZHVsZVNldDtcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uIChhLCBiLCBrKSB7XHJcbiAgICAgICAgaWYgKGsgPT09IHZvaWQgMCkgeyBrID0gMDsgfVxyXG4gICAgICAgIHZhciBpbkludCA9IGEuaW5jb21pbmcuaW50ZXJzZWN0aW9uKGIuaW5jb21pbmcpLCBvdXRJbnQgPSBhLm91dGdvaW5nLmludGVyc2VjdGlvbihiLm91dGdvaW5nKTtcclxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBuZXcgTW9kdWxlU2V0KCk7XHJcbiAgICAgICAgY2hpbGRyZW4uYWRkKGEpO1xyXG4gICAgICAgIGNoaWxkcmVuLmFkZChiKTtcclxuICAgICAgICB2YXIgbSA9IG5ldyBNb2R1bGUodGhpcy5tb2R1bGVzLmxlbmd0aCwgb3V0SW50LCBpbkludCwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMubW9kdWxlcy5wdXNoKG0pO1xyXG4gICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAocywgaSwgbykge1xyXG4gICAgICAgICAgICBzLmZvckFsbChmdW5jdGlvbiAobXMsIGxpbmt0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBtcy5mb3JBbGwoZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmxzID0gbltpXTtcclxuICAgICAgICAgICAgICAgICAgICBubHMuYWRkKGxpbmt0eXBlLCBtKTtcclxuICAgICAgICAgICAgICAgICAgICBubHMucmVtb3ZlKGxpbmt0eXBlLCBhKTtcclxuICAgICAgICAgICAgICAgICAgICBubHMucmVtb3ZlKGxpbmt0eXBlLCBiKTtcclxuICAgICAgICAgICAgICAgICAgICBhW29dLnJlbW92ZShsaW5rdHlwZSwgbik7XHJcbiAgICAgICAgICAgICAgICAgICAgYltvXS5yZW1vdmUobGlua3R5cGUsIG4pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdXBkYXRlKG91dEludCwgXCJpbmNvbWluZ1wiLCBcIm91dGdvaW5nXCIpO1xyXG4gICAgICAgIHVwZGF0ZShpbkludCwgXCJvdXRnb2luZ1wiLCBcImluY29taW5nXCIpO1xyXG4gICAgICAgIHRoaXMuUiAtPSBpbkludC5jb3VudCgpICsgb3V0SW50LmNvdW50KCk7XHJcbiAgICAgICAgdGhpcy5yb290c1trXS5yZW1vdmUoYSk7XHJcbiAgICAgICAgdGhpcy5yb290c1trXS5yZW1vdmUoYik7XHJcbiAgICAgICAgdGhpcy5yb290c1trXS5hZGQobSk7XHJcbiAgICAgICAgcmV0dXJuIG07XHJcbiAgICB9O1xyXG4gICAgQ29uZmlndXJhdGlvbi5wcm90b3R5cGUucm9vdE1lcmdlcyA9IGZ1bmN0aW9uIChrKSB7XHJcbiAgICAgICAgaWYgKGsgPT09IHZvaWQgMCkgeyBrID0gMDsgfVxyXG4gICAgICAgIHZhciBycyA9IHRoaXMucm9vdHNba10ubW9kdWxlcygpO1xyXG4gICAgICAgIHZhciBuID0gcnMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBtZXJnZXMgPSBuZXcgQXJyYXkobiAqIChuIC0gMSkpO1xyXG4gICAgICAgIHZhciBjdHIgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpXyA9IG4gLSAxOyBpIDwgaV87ICsraSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBuOyArK2opIHtcclxuICAgICAgICAgICAgICAgIHZhciBhID0gcnNbaV0sIGIgPSByc1tqXTtcclxuICAgICAgICAgICAgICAgIG1lcmdlc1tjdHJdID0geyBpZDogY3RyLCBuRWRnZXM6IHRoaXMubkVkZ2VzKGEsIGIpLCBhOiBhLCBiOiBiIH07XHJcbiAgICAgICAgICAgICAgICBjdHIrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWVyZ2VzO1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmdyZWVkeU1lcmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yb290cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yb290c1tpXS5tb2R1bGVzKCkubGVuZ3RoIDwgMilcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB2YXIgbXMgPSB0aGlzLnJvb3RNZXJnZXMoaSkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5uRWRnZXMgPT0gYi5uRWRnZXMgPyBhLmlkIC0gYi5pZCA6IGEubkVkZ2VzIC0gYi5uRWRnZXM7IH0pO1xyXG4gICAgICAgICAgICB2YXIgbSA9IG1zWzBdO1xyXG4gICAgICAgICAgICBpZiAobS5uRWRnZXMgPj0gdGhpcy5SKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHRoaXMubWVyZ2UobS5hLCBtLmIsIGkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgQ29uZmlndXJhdGlvbi5wcm90b3R5cGUubkVkZ2VzID0gZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICB2YXIgaW5JbnQgPSBhLmluY29taW5nLmludGVyc2VjdGlvbihiLmluY29taW5nKSwgb3V0SW50ID0gYS5vdXRnb2luZy5pbnRlcnNlY3Rpb24oYi5vdXRnb2luZyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuUiAtIGluSW50LmNvdW50KCkgLSBvdXRJbnQuY291bnQoKTtcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5nZXRHcm91cEhpZXJhcmNoeSA9IGZ1bmN0aW9uIChyZXRhcmdldGVkRWRnZXMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBncm91cHMgPSBbXTtcclxuICAgICAgICB2YXIgcm9vdCA9IHt9O1xyXG4gICAgICAgIHRvR3JvdXBzKHRoaXMucm9vdHNbMF0sIHJvb3QsIGdyb3Vwcyk7XHJcbiAgICAgICAgdmFyIGVzID0gdGhpcy5hbGxFZGdlcygpO1xyXG4gICAgICAgIGVzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBfdGhpcy5tb2R1bGVzW2Uuc291cmNlXTtcclxuICAgICAgICAgICAgdmFyIGIgPSBfdGhpcy5tb2R1bGVzW2UudGFyZ2V0XTtcclxuICAgICAgICAgICAgcmV0YXJnZXRlZEVkZ2VzLnB1c2gobmV3IFBvd2VyRWRnZSh0eXBlb2YgYS5naWQgPT09IFwidW5kZWZpbmVkXCIgPyBlLnNvdXJjZSA6IGdyb3Vwc1thLmdpZF0sIHR5cGVvZiBiLmdpZCA9PT0gXCJ1bmRlZmluZWRcIiA/IGUudGFyZ2V0IDogZ3JvdXBzW2IuZ2lkXSwgZS50eXBlKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwcztcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5hbGxFZGdlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXMgPSBbXTtcclxuICAgICAgICBDb25maWd1cmF0aW9uLmdldEVkZ2VzKHRoaXMucm9vdHNbMF0sIGVzKTtcclxuICAgICAgICByZXR1cm4gZXM7XHJcbiAgICB9O1xyXG4gICAgQ29uZmlndXJhdGlvbi5nZXRFZGdlcyA9IGZ1bmN0aW9uIChtb2R1bGVzLCBlcykge1xyXG4gICAgICAgIG1vZHVsZXMuZm9yQWxsKGZ1bmN0aW9uIChtKSB7XHJcbiAgICAgICAgICAgIG0uZ2V0RWRnZXMoZXMpO1xyXG4gICAgICAgICAgICBDb25maWd1cmF0aW9uLmdldEVkZ2VzKG0uY2hpbGRyZW4sIGVzKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ29uZmlndXJhdGlvbjtcclxufSgpKTtcclxuZXhwb3J0cy5Db25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbjtcclxuZnVuY3Rpb24gdG9Hcm91cHMobW9kdWxlcywgZ3JvdXAsIGdyb3Vwcykge1xyXG4gICAgbW9kdWxlcy5mb3JBbGwoZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICBpZiAobS5pc0xlYWYoKSkge1xyXG4gICAgICAgICAgICBpZiAoIWdyb3VwLmxlYXZlcylcclxuICAgICAgICAgICAgICAgIGdyb3VwLmxlYXZlcyA9IFtdO1xyXG4gICAgICAgICAgICBncm91cC5sZWF2ZXMucHVzaChtLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBnID0gZ3JvdXA7XHJcbiAgICAgICAgICAgIG0uZ2lkID0gZ3JvdXBzLmxlbmd0aDtcclxuICAgICAgICAgICAgaWYgKCFtLmlzSXNsYW5kKCkgfHwgbS5pc1ByZWRlZmluZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgZyA9IHsgaWQ6IG0uZ2lkIH07XHJcbiAgICAgICAgICAgICAgICBpZiAobS5pc1ByZWRlZmluZWQoKSlcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG0uZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ1twcm9wXSA9IG0uZGVmaW5pdGlvbltwcm9wXTtcclxuICAgICAgICAgICAgICAgIGlmICghZ3JvdXAuZ3JvdXBzKVxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwLmdyb3VwcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAuZ3JvdXBzLnB1c2gobS5naWQpO1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBzLnB1c2goZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9Hcm91cHMobS5jaGlsZHJlbiwgZywgZ3JvdXBzKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG52YXIgTW9kdWxlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE1vZHVsZShpZCwgb3V0Z29pbmcsIGluY29taW5nLCBjaGlsZHJlbiwgZGVmaW5pdGlvbikge1xyXG4gICAgICAgIGlmIChvdXRnb2luZyA9PT0gdm9pZCAwKSB7IG91dGdvaW5nID0gbmV3IExpbmtTZXRzKCk7IH1cclxuICAgICAgICBpZiAoaW5jb21pbmcgPT09IHZvaWQgMCkgeyBpbmNvbWluZyA9IG5ldyBMaW5rU2V0cygpOyB9XHJcbiAgICAgICAgaWYgKGNoaWxkcmVuID09PSB2b2lkIDApIHsgY2hpbGRyZW4gPSBuZXcgTW9kdWxlU2V0KCk7IH1cclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5vdXRnb2luZyA9IG91dGdvaW5nO1xyXG4gICAgICAgIHRoaXMuaW5jb21pbmcgPSBpbmNvbWluZztcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uID0gZGVmaW5pdGlvbjtcclxuICAgIH1cclxuICAgIE1vZHVsZS5wcm90b3R5cGUuZ2V0RWRnZXMgPSBmdW5jdGlvbiAoZXMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub3V0Z29pbmcuZm9yQWxsKGZ1bmN0aW9uIChtcywgZWRnZXR5cGUpIHtcclxuICAgICAgICAgICAgbXMuZm9yQWxsKGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGVzLnB1c2gobmV3IFBvd2VyRWRnZShfdGhpcy5pZCwgdGFyZ2V0LmlkLCBlZGdldHlwZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBNb2R1bGUucHJvdG90eXBlLmlzTGVhZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5jb3VudCgpID09PSAwO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZS5wcm90b3R5cGUuaXNJc2xhbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3V0Z29pbmcuY291bnQoKSA9PT0gMCAmJiB0aGlzLmluY29taW5nLmNvdW50KCkgPT09IDA7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlLnByb3RvdHlwZS5pc1ByZWRlZmluZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmRlZmluaXRpb24gIT09IFwidW5kZWZpbmVkXCI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIE1vZHVsZTtcclxufSgpKTtcclxuZXhwb3J0cy5Nb2R1bGUgPSBNb2R1bGU7XHJcbmZ1bmN0aW9uIGludGVyc2VjdGlvbihtLCBuKSB7XHJcbiAgICB2YXIgaSA9IHt9O1xyXG4gICAgZm9yICh2YXIgdiBpbiBtKVxyXG4gICAgICAgIGlmICh2IGluIG4pXHJcbiAgICAgICAgICAgIGlbdl0gPSBtW3ZdO1xyXG4gICAgcmV0dXJuIGk7XHJcbn1cclxudmFyIE1vZHVsZVNldCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBNb2R1bGVTZXQoKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZSA9IHt9O1xyXG4gICAgfVxyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy50YWJsZSkubGVuZ3RoO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUuaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBNb2R1bGVTZXQoKTtcclxuICAgICAgICByZXN1bHQudGFibGUgPSBpbnRlcnNlY3Rpb24odGhpcy50YWJsZSwgb3RoZXIudGFibGUpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5pbnRlcnNlY3Rpb25Db3VudCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyc2VjdGlvbihvdGhlcikuY291bnQoKTtcclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIGlkIGluIHRoaXMudGFibGU7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgIHRoaXMudGFibGVbbS5pZF0gPSBtO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICBkZWxldGUgdGhpcy50YWJsZVttLmlkXTtcclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmZvckFsbCA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbWlkIGluIHRoaXMudGFibGUpIHtcclxuICAgICAgICAgICAgZih0aGlzLnRhYmxlW21pZF0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLm1vZHVsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHZzID0gW107XHJcbiAgICAgICAgdGhpcy5mb3JBbGwoZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICAgICAgaWYgKCFtLmlzUHJlZGVmaW5lZCgpKVxyXG4gICAgICAgICAgICAgICAgdnMucHVzaChtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdnM7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIE1vZHVsZVNldDtcclxufSgpKTtcclxuZXhwb3J0cy5Nb2R1bGVTZXQgPSBNb2R1bGVTZXQ7XHJcbnZhciBMaW5rU2V0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMaW5rU2V0cygpIHtcclxuICAgICAgICB0aGlzLnNldHMgPSB7fTtcclxuICAgICAgICB0aGlzLm4gPSAwO1xyXG4gICAgfVxyXG4gICAgTGlua1NldHMucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm47XHJcbiAgICB9O1xyXG4gICAgTGlua1NldHMucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZm9yQWxsTW9kdWxlcyhmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCAmJiBtLmlkID09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGxpbmt0eXBlLCBtKSB7XHJcbiAgICAgICAgdmFyIHMgPSBsaW5rdHlwZSBpbiB0aGlzLnNldHMgPyB0aGlzLnNldHNbbGlua3R5cGVdIDogdGhpcy5zZXRzW2xpbmt0eXBlXSA9IG5ldyBNb2R1bGVTZXQoKTtcclxuICAgICAgICBzLmFkZChtKTtcclxuICAgICAgICArK3RoaXMubjtcclxuICAgIH07XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGxpbmt0eXBlLCBtKSB7XHJcbiAgICAgICAgdmFyIG1zID0gdGhpcy5zZXRzW2xpbmt0eXBlXTtcclxuICAgICAgICBtcy5yZW1vdmUobSk7XHJcbiAgICAgICAgaWYgKG1zLmNvdW50KCkgPT09IDApIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2V0c1tsaW5rdHlwZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC0tdGhpcy5uO1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5mb3JBbGwgPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIGZvciAodmFyIGxpbmt0eXBlIGluIHRoaXMuc2V0cykge1xyXG4gICAgICAgICAgICBmKHRoaXMuc2V0c1tsaW5rdHlwZV0sIE51bWJlcihsaW5rdHlwZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuZm9yQWxsTW9kdWxlcyA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgdGhpcy5mb3JBbGwoZnVuY3Rpb24gKG1zLCBsdCkgeyByZXR1cm4gbXMuZm9yQWxsKGYpOyB9KTtcclxuICAgIH07XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBMaW5rU2V0cygpO1xyXG4gICAgICAgIHRoaXMuZm9yQWxsKGZ1bmN0aW9uIChtcywgbHQpIHtcclxuICAgICAgICAgICAgaWYgKGx0IGluIG90aGVyLnNldHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpID0gbXMuaW50ZXJzZWN0aW9uKG90aGVyLnNldHNbbHRdKSwgbiA9IGkuY291bnQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChuID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zZXRzW2x0XSA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm4gKz0gbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIExpbmtTZXRzO1xyXG59KCkpO1xyXG5leHBvcnRzLkxpbmtTZXRzID0gTGlua1NldHM7XHJcbmZ1bmN0aW9uIGludGVyc2VjdGlvbkNvdW50KG0sIG4pIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhpbnRlcnNlY3Rpb24obSwgbikpLmxlbmd0aDtcclxufVxyXG5mdW5jdGlvbiBnZXRHcm91cHMobm9kZXMsIGxpbmtzLCBsYSwgcm9vdEdyb3VwKSB7XHJcbiAgICB2YXIgbiA9IG5vZGVzLmxlbmd0aCwgYyA9IG5ldyBDb25maWd1cmF0aW9uKG4sIGxpbmtzLCBsYSwgcm9vdEdyb3VwKTtcclxuICAgIHdoaWxlIChjLmdyZWVkeU1lcmdlKCkpXHJcbiAgICAgICAgO1xyXG4gICAgdmFyIHBvd2VyRWRnZXMgPSBbXTtcclxuICAgIHZhciBnID0gYy5nZXRHcm91cEhpZXJhcmNoeShwb3dlckVkZ2VzKTtcclxuICAgIHBvd2VyRWRnZXMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHZhciBmID0gZnVuY3Rpb24gKGVuZCkge1xyXG4gICAgICAgICAgICB2YXIgZyA9IGVbZW5kXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBnID09IFwibnVtYmVyXCIpXHJcbiAgICAgICAgICAgICAgICBlW2VuZF0gPSBub2Rlc1tnXTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGYoXCJzb3VyY2VcIik7XHJcbiAgICAgICAgZihcInRhcmdldFwiKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHsgZ3JvdXBzOiBnLCBwb3dlckVkZ2VzOiBwb3dlckVkZ2VzIH07XHJcbn1cclxuZXhwb3J0cy5nZXRHcm91cHMgPSBnZXRHcm91cHM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvd2VyZ3JhcGguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFBhaXJpbmdIZWFwID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBhaXJpbmdIZWFwKGVsZW0pIHtcclxuICAgICAgICB0aGlzLmVsZW0gPSBlbGVtO1xyXG4gICAgICAgIHRoaXMuc3ViaGVhcHMgPSBbXTtcclxuICAgIH1cclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgIHZhciBzdHIgPSBcIlwiLCBuZWVkQ29tbWEgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViaGVhcHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHN1YmhlYXAgPSB0aGlzLnN1YmhlYXBzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXN1YmhlYXAuZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgbmVlZENvbW1hID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmVlZENvbW1hKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIgKyBcIixcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSBzdHIgKyBzdWJoZWFwLnRvU3RyaW5nKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgbmVlZENvbW1hID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0ciAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBzdHIgPSBcIihcIiArIHN0ciArIFwiKVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHRoaXMuZWxlbSA/IHNlbGVjdG9yKHRoaXMuZWxlbSkgOiBcIlwiKSArIHN0cjtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmVtcHR5KCkpIHtcclxuICAgICAgICAgICAgZih0aGlzLmVsZW0sIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLnN1YmhlYXBzLmZvckVhY2goZnVuY3Rpb24gKHMpIHsgcmV0dXJuIHMuZm9yRWFjaChmKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbXB0eSgpID8gMCA6IDEgKyB0aGlzLnN1YmhlYXBzLnJlZHVjZShmdW5jdGlvbiAobiwgaCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbiArIGguY291bnQoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW07XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW0gPT0gbnVsbDtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaCkge1xyXG4gICAgICAgIGlmICh0aGlzID09PSBoKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViaGVhcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3ViaGVhcHNbaV0uY29udGFpbnMoaCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5pc0hlYXAgPSBmdW5jdGlvbiAobGVzc1RoYW4pIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN1YmhlYXBzLmV2ZXJ5KGZ1bmN0aW9uIChoKSB7IHJldHVybiBsZXNzVGhhbihfdGhpcy5lbGVtLCBoLmVsZW0pICYmIGguaXNIZWFwKGxlc3NUaGFuKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIChvYmosIGxlc3NUaGFuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2UobmV3IFBhaXJpbmdIZWFwKG9iaiksIGxlc3NUaGFuKTtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbiAoaGVhcDIsIGxlc3NUaGFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW1wdHkoKSlcclxuICAgICAgICAgICAgcmV0dXJuIGhlYXAyO1xyXG4gICAgICAgIGVsc2UgaWYgKGhlYXAyLmVtcHR5KCkpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGVsc2UgaWYgKGxlc3NUaGFuKHRoaXMuZWxlbSwgaGVhcDIuZWxlbSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zdWJoZWFwcy5wdXNoKGhlYXAyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBoZWFwMi5zdWJoZWFwcy5wdXNoKHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gaGVhcDI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5yZW1vdmVNaW4gPSBmdW5jdGlvbiAobGVzc1RoYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5lbXB0eSgpKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1lcmdlUGFpcnMobGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5tZXJnZVBhaXJzID0gZnVuY3Rpb24gKGxlc3NUaGFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3ViaGVhcHMubGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGFpcmluZ0hlYXAobnVsbCk7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5zdWJoZWFwcy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdWJoZWFwc1swXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBmaXJzdFBhaXIgPSB0aGlzLnN1YmhlYXBzLnBvcCgpLm1lcmdlKHRoaXMuc3ViaGVhcHMucG9wKCksIGxlc3NUaGFuKTtcclxuICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMubWVyZ2VQYWlycyhsZXNzVGhhbik7XHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdFBhaXIubWVyZ2UocmVtYWluaW5nLCBsZXNzVGhhbik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5kZWNyZWFzZUtleSA9IGZ1bmN0aW9uIChzdWJoZWFwLCBuZXdWYWx1ZSwgc2V0SGVhcE5vZGUsIGxlc3NUaGFuKSB7XHJcbiAgICAgICAgdmFyIG5ld0hlYXAgPSBzdWJoZWFwLnJlbW92ZU1pbihsZXNzVGhhbik7XHJcbiAgICAgICAgc3ViaGVhcC5lbGVtID0gbmV3SGVhcC5lbGVtO1xyXG4gICAgICAgIHN1YmhlYXAuc3ViaGVhcHMgPSBuZXdIZWFwLnN1YmhlYXBzO1xyXG4gICAgICAgIGlmIChzZXRIZWFwTm9kZSAhPT0gbnVsbCAmJiBuZXdIZWFwLmVsZW0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgc2V0SGVhcE5vZGUoc3ViaGVhcC5lbGVtLCBzdWJoZWFwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhaXJpbmdOb2RlID0gbmV3IFBhaXJpbmdIZWFwKG5ld1ZhbHVlKTtcclxuICAgICAgICBpZiAoc2V0SGVhcE5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgc2V0SGVhcE5vZGUobmV3VmFsdWUsIHBhaXJpbmdOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2UocGFpcmluZ05vZGUsIGxlc3NUaGFuKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUGFpcmluZ0hlYXA7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUGFpcmluZ0hlYXAgPSBQYWlyaW5nSGVhcDtcclxudmFyIFByaW9yaXR5UXVldWUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUHJpb3JpdHlRdWV1ZShsZXNzVGhhbikge1xyXG4gICAgICAgIHRoaXMubGVzc1RoYW4gPSBsZXNzVGhhbjtcclxuICAgIH1cclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLnRvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5lbXB0eSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5yb290LmVsZW07XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhaXJpbmdOb2RlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBhcmc7IGFyZyA9IGFyZ3NbaV07ICsraSkge1xyXG4gICAgICAgICAgICBwYWlyaW5nTm9kZSA9IG5ldyBQYWlyaW5nSGVhcChhcmcpO1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QgPSB0aGlzLmVtcHR5KCkgP1xyXG4gICAgICAgICAgICAgICAgcGFpcmluZ05vZGUgOiB0aGlzLnJvb3QubWVyZ2UocGFpcmluZ05vZGUsIHRoaXMubGVzc1RoYW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFpcmluZ05vZGU7XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLnJvb3QgfHwgIXRoaXMucm9vdC5lbGVtO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmlzSGVhcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb290LmlzSGVhcCh0aGlzLmxlc3NUaGFuKTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB0aGlzLnJvb3QuZm9yRWFjaChmKTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW1wdHkoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9iaiA9IHRoaXMucm9vdC5taW4oKTtcclxuICAgICAgICB0aGlzLnJvb3QgPSB0aGlzLnJvb3QucmVtb3ZlTWluKHRoaXMubGVzc1RoYW4pO1xyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUucmVkdWNlS2V5ID0gZnVuY3Rpb24gKGhlYXBOb2RlLCBuZXdLZXksIHNldEhlYXBOb2RlKSB7XHJcbiAgICAgICAgaWYgKHNldEhlYXBOb2RlID09PSB2b2lkIDApIHsgc2V0SGVhcE5vZGUgPSBudWxsOyB9XHJcbiAgICAgICAgdGhpcy5yb290ID0gdGhpcy5yb290LmRlY3JlYXNlS2V5KGhlYXBOb2RlLCBuZXdLZXksIHNldEhlYXBOb2RlLCB0aGlzLmxlc3NUaGFuKTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3QudG9TdHJpbmcoc2VsZWN0b3IpO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3QuY291bnQoKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUHJpb3JpdHlRdWV1ZTtcclxufSgpKTtcclxuZXhwb3J0cy5Qcmlvcml0eVF1ZXVlID0gUHJpb3JpdHlRdWV1ZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHF1ZXVlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgVHJlZUJhc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVHJlZUJhc2UoKSB7XHJcbiAgICAgICAgdGhpcy5maW5kSXRlciA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciByZXMgPSB0aGlzLl9yb290O1xyXG4gICAgICAgICAgICB2YXIgaXRlciA9IHRoaXMuaXRlcmF0b3IoKTtcclxuICAgICAgICAgICAgd2hpbGUgKHJlcyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGMgPSB0aGlzLl9jb21wYXJhdG9yKGRhdGEsIHJlcy5kYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChjID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlci5fY3Vyc29yID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlci5fYW5jZXN0b3JzLnB1c2gocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMgPSByZXMuZ2V0X2NoaWxkKGMgPiAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3Jvb3QgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciByZXMgPSB0aGlzLl9yb290O1xyXG4gICAgICAgIHdoaWxlIChyZXMgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIGMgPSB0aGlzLl9jb21wYXJhdG9yKGRhdGEsIHJlcy5kYXRhKTtcclxuICAgICAgICAgICAgaWYgKGMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5nZXRfY2hpbGQoYyA+IDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5sb3dlckJvdW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYm91bmQoZGF0YSwgdGhpcy5fY29tcGFyYXRvcik7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLnVwcGVyQm91bmQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBjbXAgPSB0aGlzLl9jb21wYXJhdG9yO1xyXG4gICAgICAgIGZ1bmN0aW9uIHJldmVyc2VfY21wKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNtcChiLCBhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdW5kKGRhdGEsIHJldmVyc2VfY21wKTtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXMgPSB0aGlzLl9yb290O1xyXG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChyZXMubGVmdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXMgPSByZXMubGVmdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlcyA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgaWYgKHJlcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHJlcy5yaWdodCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXMgPSByZXMucmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUuaXRlcmF0b3IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcih0aGlzKTtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uIChjYikge1xyXG4gICAgICAgIHZhciBpdCA9IHRoaXMuaXRlcmF0b3IoKSwgZGF0YTtcclxuICAgICAgICB3aGlsZSAoKGRhdGEgPSBpdC5uZXh0KCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNiKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUucmVhY2ggPSBmdW5jdGlvbiAoY2IpIHtcclxuICAgICAgICB2YXIgaXQgPSB0aGlzLml0ZXJhdG9yKCksIGRhdGE7XHJcbiAgICAgICAgd2hpbGUgKChkYXRhID0gaXQucHJldigpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYihkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLl9ib3VuZCA9IGZ1bmN0aW9uIChkYXRhLCBjbXApIHtcclxuICAgICAgICB2YXIgY3VyID0gdGhpcy5fcm9vdDtcclxuICAgICAgICB2YXIgaXRlciA9IHRoaXMuaXRlcmF0b3IoKTtcclxuICAgICAgICB3aGlsZSAoY3VyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gdGhpcy5fY29tcGFyYXRvcihkYXRhLCBjdXIuZGF0YSk7XHJcbiAgICAgICAgICAgIGlmIChjID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVyLl9jdXJzb3IgPSBjdXI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVyLl9hbmNlc3RvcnMucHVzaChjdXIpO1xyXG4gICAgICAgICAgICBjdXIgPSBjdXIuZ2V0X2NoaWxkKGMgPiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGl0ZXIuX2FuY2VzdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICBjdXIgPSBpdGVyLl9hbmNlc3RvcnNbaV07XHJcbiAgICAgICAgICAgIGlmIChjbXAoZGF0YSwgY3VyLmRhdGEpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaXRlci5fY3Vyc29yID0gY3VyO1xyXG4gICAgICAgICAgICAgICAgaXRlci5fYW5jZXN0b3JzLmxlbmd0aCA9IGk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpdGVyLl9hbmNlc3RvcnMubGVuZ3RoID0gMDtcclxuICAgICAgICByZXR1cm4gaXRlcjtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICByZXR1cm4gVHJlZUJhc2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVHJlZUJhc2UgPSBUcmVlQmFzZTtcclxudmFyIEl0ZXJhdG9yID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEl0ZXJhdG9yKHRyZWUpIHtcclxuICAgICAgICB0aGlzLl90cmVlID0gdHJlZTtcclxuICAgICAgICB0aGlzLl9hbmNlc3RvcnMgPSBbXTtcclxuICAgICAgICB0aGlzLl9jdXJzb3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgSXRlcmF0b3IucHJvdG90eXBlLmRhdGEgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnNvciAhPT0gbnVsbCA/IHRoaXMuX2N1cnNvci5kYXRhIDogbnVsbDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3Vyc29yID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciByb290ID0gdGhpcy5fdHJlZS5fcm9vdDtcclxuICAgICAgICAgICAgaWYgKHJvb3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbk5vZGUocm9vdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJzb3IucmlnaHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzYXZlO1xyXG4gICAgICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmUgPSB0aGlzLl9jdXJzb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2FuY2VzdG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3Vyc29yID0gdGhpcy5fYW5jZXN0b3JzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3Vyc29yID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSB3aGlsZSAodGhpcy5fY3Vyc29yLnJpZ2h0ID09PSBzYXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FuY2VzdG9ycy5wdXNoKHRoaXMuX2N1cnNvcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9taW5Ob2RlKHRoaXMuX2N1cnNvci5yaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnNvciAhPT0gbnVsbCA/IHRoaXMuX2N1cnNvci5kYXRhIDogbnVsbDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBJdGVyYXRvci5wcm90b3R5cGUucHJldiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3Vyc29yID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciByb290ID0gdGhpcy5fdHJlZS5fcm9vdDtcclxuICAgICAgICAgICAgaWYgKHJvb3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21heE5vZGUocm9vdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJzb3IubGVmdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNhdmU7XHJcbiAgICAgICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZSA9IHRoaXMuX2N1cnNvcjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fYW5jZXN0b3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJzb3IgPSB0aGlzLl9hbmNlc3RvcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJzb3IgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IHdoaWxlICh0aGlzLl9jdXJzb3IubGVmdCA9PT0gc2F2ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmNlc3RvcnMucHVzaCh0aGlzLl9jdXJzb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4Tm9kZSh0aGlzLl9jdXJzb3IubGVmdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnNvciAhPT0gbnVsbCA/IHRoaXMuX2N1cnNvci5kYXRhIDogbnVsbDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBJdGVyYXRvci5wcm90b3R5cGUuX21pbk5vZGUgPSBmdW5jdGlvbiAoc3RhcnQpIHtcclxuICAgICAgICB3aGlsZSAoc3RhcnQubGVmdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hbmNlc3RvcnMucHVzaChzdGFydCk7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RhcnQubGVmdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY3Vyc29yID0gc3RhcnQ7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgSXRlcmF0b3IucHJvdG90eXBlLl9tYXhOb2RlID0gZnVuY3Rpb24gKHN0YXJ0KSB7XHJcbiAgICAgICAgd2hpbGUgKHN0YXJ0LnJpZ2h0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FuY2VzdG9ycy5wdXNoKHN0YXJ0KTtcclxuICAgICAgICAgICAgc3RhcnQgPSBzdGFydC5yaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY3Vyc29yID0gc3RhcnQ7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgcmV0dXJuIEl0ZXJhdG9yO1xyXG59KCkpO1xyXG5leHBvcnRzLkl0ZXJhdG9yID0gSXRlcmF0b3I7XHJcbnZhciBOb2RlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5vZGUoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5sZWZ0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnJpZ2h0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnJlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBOb2RlLnByb3RvdHlwZS5nZXRfY2hpbGQgPSBmdW5jdGlvbiAoZGlyKSB7XHJcbiAgICAgICAgcmV0dXJuIGRpciA/IHRoaXMucmlnaHQgOiB0aGlzLmxlZnQ7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgTm9kZS5wcm90b3R5cGUuc2V0X2NoaWxkID0gZnVuY3Rpb24gKGRpciwgdmFsKSB7XHJcbiAgICAgICAgaWYgKGRpcikge1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICA7XHJcbiAgICByZXR1cm4gTm9kZTtcclxufSgpKTtcclxudmFyIFJCVHJlZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoUkJUcmVlLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gUkJUcmVlKGNvbXBhcmF0b3IpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLl9yb290ID0gbnVsbDtcclxuICAgICAgICBfdGhpcy5fY29tcGFyYXRvciA9IGNvbXBhcmF0b3I7XHJcbiAgICAgICAgX3RoaXMuc2l6ZSA9IDA7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgUkJUcmVlLnByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciByZXQgPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5fcm9vdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yb290ID0gbmV3IE5vZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIHJldCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGhlYWQgPSBuZXcgTm9kZSh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB2YXIgZGlyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBsYXN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBncCA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBnZ3AgPSBoZWFkO1xyXG4gICAgICAgICAgICB2YXIgcCA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5fcm9vdDtcclxuICAgICAgICAgICAgZ2dwLnJpZ2h0ID0gdGhpcy5fcm9vdDtcclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG5ldyBOb2RlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHAuc2V0X2NoaWxkKGRpciwgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFJCVHJlZS5pc19yZWQobm9kZS5sZWZ0KSAmJiBSQlRyZWUuaXNfcmVkKG5vZGUucmlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUubGVmdC5yZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnJpZ2h0LnJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKFJCVHJlZS5pc19yZWQobm9kZSkgJiYgUkJUcmVlLmlzX3JlZChwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXIyID0gZ2dwLnJpZ2h0ID09PSBncDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gcC5nZXRfY2hpbGQobGFzdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2dwLnNldF9jaGlsZChkaXIyLCBSQlRyZWUuc2luZ2xlX3JvdGF0ZShncCwgIWxhc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdncC5zZXRfY2hpbGQoZGlyMiwgUkJUcmVlLmRvdWJsZV9yb3RhdGUoZ3AsICFsYXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGNtcCA9IHRoaXMuX2NvbXBhcmF0b3Iobm9kZS5kYXRhLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxhc3QgPSBkaXI7XHJcbiAgICAgICAgICAgICAgICBkaXIgPSBjbXAgPCAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdwICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2dwID0gZ3A7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBncCA9IHA7XHJcbiAgICAgICAgICAgICAgICBwID0gbm9kZTtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLmdldF9jaGlsZChkaXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QgPSBoZWFkLnJpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yb290LnJlZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgUkJUcmVlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yb290ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhlYWQgPSBuZXcgTm9kZSh1bmRlZmluZWQpO1xyXG4gICAgICAgIHZhciBub2RlID0gaGVhZDtcclxuICAgICAgICBub2RlLnJpZ2h0ID0gdGhpcy5fcm9vdDtcclxuICAgICAgICB2YXIgcCA9IG51bGw7XHJcbiAgICAgICAgdmFyIGdwID0gbnVsbDtcclxuICAgICAgICB2YXIgZm91bmQgPSBudWxsO1xyXG4gICAgICAgIHZhciBkaXIgPSB0cnVlO1xyXG4gICAgICAgIHdoaWxlIChub2RlLmdldF9jaGlsZChkaXIpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0ID0gZGlyO1xyXG4gICAgICAgICAgICBncCA9IHA7XHJcbiAgICAgICAgICAgIHAgPSBub2RlO1xyXG4gICAgICAgICAgICBub2RlID0gbm9kZS5nZXRfY2hpbGQoZGlyKTtcclxuICAgICAgICAgICAgdmFyIGNtcCA9IHRoaXMuX2NvbXBhcmF0b3IoZGF0YSwgbm9kZS5kYXRhKTtcclxuICAgICAgICAgICAgZGlyID0gY21wID4gMDtcclxuICAgICAgICAgICAgaWYgKGNtcCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZm91bmQgPSBub2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghUkJUcmVlLmlzX3JlZChub2RlKSAmJiAhUkJUcmVlLmlzX3JlZChub2RlLmdldF9jaGlsZChkaXIpKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKFJCVHJlZS5pc19yZWQobm9kZS5nZXRfY2hpbGQoIWRpcikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNyID0gUkJUcmVlLnNpbmdsZV9yb3RhdGUobm9kZSwgZGlyKTtcclxuICAgICAgICAgICAgICAgICAgICBwLnNldF9jaGlsZChsYXN0LCBzcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcCA9IHNyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIVJCVHJlZS5pc19yZWQobm9kZS5nZXRfY2hpbGQoIWRpcikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNpYmxpbmcgPSBwLmdldF9jaGlsZCghbGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpYmxpbmcgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFSQlRyZWUuaXNfcmVkKHNpYmxpbmcuZ2V0X2NoaWxkKCFsYXN0KSkgJiYgIVJCVHJlZS5pc19yZWQoc2libGluZy5nZXRfY2hpbGQobGFzdCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwLnJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2libGluZy5yZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcjIgPSBncC5yaWdodCA9PT0gcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChSQlRyZWUuaXNfcmVkKHNpYmxpbmcuZ2V0X2NoaWxkKGxhc3QpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdwLnNldF9jaGlsZChkaXIyLCBSQlRyZWUuZG91YmxlX3JvdGF0ZShwLCBsYXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChSQlRyZWUuaXNfcmVkKHNpYmxpbmcuZ2V0X2NoaWxkKCFsYXN0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncC5zZXRfY2hpbGQoZGlyMiwgUkJUcmVlLnNpbmdsZV9yb3RhdGUocCwgbGFzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdwYyA9IGdwLmdldF9jaGlsZChkaXIyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdwYy5yZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3BjLmxlZnQucmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncGMucmlnaHQucmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZvdW5kICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGZvdW5kLmRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgICAgIHAuc2V0X2NoaWxkKHAucmlnaHQgPT09IG5vZGUsIG5vZGUuZ2V0X2NoaWxkKG5vZGUubGVmdCA9PT0gbnVsbCkpO1xyXG4gICAgICAgICAgICB0aGlzLnNpemUtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcm9vdCA9IGhlYWQucmlnaHQ7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Jvb3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fcm9vdC5yZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kICE9PSBudWxsO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFJCVHJlZS5pc19yZWQgPSBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIHJldHVybiBub2RlICE9PSBudWxsICYmIG5vZGUucmVkO1xyXG4gICAgfTtcclxuICAgIFJCVHJlZS5zaW5nbGVfcm90YXRlID0gZnVuY3Rpb24gKHJvb3QsIGRpcikge1xyXG4gICAgICAgIHZhciBzYXZlID0gcm9vdC5nZXRfY2hpbGQoIWRpcik7XHJcbiAgICAgICAgcm9vdC5zZXRfY2hpbGQoIWRpciwgc2F2ZS5nZXRfY2hpbGQoZGlyKSk7XHJcbiAgICAgICAgc2F2ZS5zZXRfY2hpbGQoZGlyLCByb290KTtcclxuICAgICAgICByb290LnJlZCA9IHRydWU7XHJcbiAgICAgICAgc2F2ZS5yZWQgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gc2F2ZTtcclxuICAgIH07XHJcbiAgICBSQlRyZWUuZG91YmxlX3JvdGF0ZSA9IGZ1bmN0aW9uIChyb290LCBkaXIpIHtcclxuICAgICAgICByb290LnNldF9jaGlsZCghZGlyLCBSQlRyZWUuc2luZ2xlX3JvdGF0ZShyb290LmdldF9jaGlsZCghZGlyKSwgIWRpcikpO1xyXG4gICAgICAgIHJldHVybiBSQlRyZWUuc2luZ2xlX3JvdGF0ZShyb290LCBkaXIpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBSQlRyZWU7XHJcbn0oVHJlZUJhc2UpKTtcclxuZXhwb3J0cy5SQlRyZWUgPSBSQlRyZWU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJidHJlZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHZwc2NfMSA9IHJlcXVpcmUoXCIuL3Zwc2NcIik7XHJcbnZhciByYnRyZWVfMSA9IHJlcXVpcmUoXCIuL3JidHJlZVwiKTtcclxuZnVuY3Rpb24gY29tcHV0ZUdyb3VwQm91bmRzKGcpIHtcclxuICAgIGcuYm91bmRzID0gdHlwZW9mIGcubGVhdmVzICE9PSBcInVuZGVmaW5lZFwiID9cclxuICAgICAgICBnLmxlYXZlcy5yZWR1Y2UoZnVuY3Rpb24gKHIsIGMpIHsgcmV0dXJuIGMuYm91bmRzLnVuaW9uKHIpOyB9LCBSZWN0YW5nbGUuZW1wdHkoKSkgOlxyXG4gICAgICAgIFJlY3RhbmdsZS5lbXB0eSgpO1xyXG4gICAgaWYgKHR5cGVvZiBnLmdyb3VwcyAhPT0gXCJ1bmRlZmluZWRcIilcclxuICAgICAgICBnLmJvdW5kcyA9IGcuZ3JvdXBzLnJlZHVjZShmdW5jdGlvbiAociwgYykgeyByZXR1cm4gY29tcHV0ZUdyb3VwQm91bmRzKGMpLnVuaW9uKHIpOyB9LCBnLmJvdW5kcyk7XHJcbiAgICBnLmJvdW5kcyA9IGcuYm91bmRzLmluZmxhdGUoZy5wYWRkaW5nKTtcclxuICAgIHJldHVybiBnLmJvdW5kcztcclxufVxyXG5leHBvcnRzLmNvbXB1dGVHcm91cEJvdW5kcyA9IGNvbXB1dGVHcm91cEJvdW5kcztcclxudmFyIFJlY3RhbmdsZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBSZWN0YW5nbGUoeCwgWCwgeSwgWSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy5YID0gWDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuWSA9IFk7XHJcbiAgICB9XHJcbiAgICBSZWN0YW5nbGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgUmVjdGFuZ2xlKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSk7IH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLmN4ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMueCArIHRoaXMuWCkgLyAyOyB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5jeSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICh0aGlzLnkgKyB0aGlzLlkpIC8gMjsgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUub3ZlcmxhcFggPSBmdW5jdGlvbiAocikge1xyXG4gICAgICAgIHZhciB1eCA9IHRoaXMuY3goKSwgdnggPSByLmN4KCk7XHJcbiAgICAgICAgaWYgKHV4IDw9IHZ4ICYmIHIueCA8IHRoaXMuWClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuWCAtIHIueDtcclxuICAgICAgICBpZiAodnggPD0gdXggJiYgdGhpcy54IDwgci5YKVxyXG4gICAgICAgICAgICByZXR1cm4gci5YIC0gdGhpcy54O1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUub3ZlcmxhcFkgPSBmdW5jdGlvbiAocikge1xyXG4gICAgICAgIHZhciB1eSA9IHRoaXMuY3koKSwgdnkgPSByLmN5KCk7XHJcbiAgICAgICAgaWYgKHV5IDw9IHZ5ICYmIHIueSA8IHRoaXMuWSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuWSAtIHIueTtcclxuICAgICAgICBpZiAodnkgPD0gdXkgJiYgdGhpcy55IDwgci5ZKVxyXG4gICAgICAgICAgICByZXR1cm4gci5ZIC0gdGhpcy55O1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUuc2V0WENlbnRyZSA9IGZ1bmN0aW9uIChjeCkge1xyXG4gICAgICAgIHZhciBkeCA9IGN4IC0gdGhpcy5jeCgpO1xyXG4gICAgICAgIHRoaXMueCArPSBkeDtcclxuICAgICAgICB0aGlzLlggKz0gZHg7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5zZXRZQ2VudHJlID0gZnVuY3Rpb24gKGN5KSB7XHJcbiAgICAgICAgdmFyIGR5ID0gY3kgLSB0aGlzLmN5KCk7XHJcbiAgICAgICAgdGhpcy55ICs9IGR5O1xyXG4gICAgICAgIHRoaXMuWSArPSBkeTtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLndpZHRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlggLSB0aGlzLng7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5oZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuWSAtIHRoaXMueTtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLnVuaW9uID0gZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFJlY3RhbmdsZShNYXRoLm1pbih0aGlzLngsIHIueCksIE1hdGgubWF4KHRoaXMuWCwgci5YKSwgTWF0aC5taW4odGhpcy55LCByLnkpLCBNYXRoLm1heCh0aGlzLlksIHIuWSkpO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUubGluZUludGVyc2VjdGlvbnMgPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcclxuICAgICAgICB2YXIgc2lkZXMgPSBbW3RoaXMueCwgdGhpcy55LCB0aGlzLlgsIHRoaXMueV0sXHJcbiAgICAgICAgICAgIFt0aGlzLlgsIHRoaXMueSwgdGhpcy5YLCB0aGlzLlldLFxyXG4gICAgICAgICAgICBbdGhpcy5YLCB0aGlzLlksIHRoaXMueCwgdGhpcy5ZXSxcclxuICAgICAgICAgICAgW3RoaXMueCwgdGhpcy5ZLCB0aGlzLngsIHRoaXMueV1dO1xyXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHIgPSBSZWN0YW5nbGUubGluZUludGVyc2VjdGlvbih4MSwgeTEsIHgyLCB5Miwgc2lkZXNbaV1bMF0sIHNpZGVzW2ldWzFdLCBzaWRlc1tpXVsyXSwgc2lkZXNbaV1bM10pO1xyXG4gICAgICAgICAgICBpZiAociAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbnMucHVzaCh7IHg6IHIueCwgeTogci55IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLnJheUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uICh4MiwgeTIpIHtcclxuICAgICAgICB2YXIgaW50cyA9IHRoaXMubGluZUludGVyc2VjdGlvbnModGhpcy5jeCgpLCB0aGlzLmN5KCksIHgyLCB5Mik7XHJcbiAgICAgICAgcmV0dXJuIGludHMubGVuZ3RoID4gMCA/IGludHNbMF0gOiBudWxsO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUudmVydGljZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgeyB4OiB0aGlzLngsIHk6IHRoaXMueSB9LFxyXG4gICAgICAgICAgICB7IHg6IHRoaXMuWCwgeTogdGhpcy55IH0sXHJcbiAgICAgICAgICAgIHsgeDogdGhpcy5YLCB5OiB0aGlzLlkgfSxcclxuICAgICAgICAgICAgeyB4OiB0aGlzLngsIHk6IHRoaXMuWSB9XHJcbiAgICAgICAgXTtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUubGluZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpIHtcclxuICAgICAgICB2YXIgZHgxMiA9IHgyIC0geDEsIGR4MzQgPSB4NCAtIHgzLCBkeTEyID0geTIgLSB5MSwgZHkzNCA9IHk0IC0geTMsIGRlbm9taW5hdG9yID0gZHkzNCAqIGR4MTIgLSBkeDM0ICogZHkxMjtcclxuICAgICAgICBpZiAoZGVub21pbmF0b3IgPT0gMClcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgdmFyIGR4MzEgPSB4MSAtIHgzLCBkeTMxID0geTEgLSB5MywgbnVtYSA9IGR4MzQgKiBkeTMxIC0gZHkzNCAqIGR4MzEsIGEgPSBudW1hIC8gZGVub21pbmF0b3IsIG51bWIgPSBkeDEyICogZHkzMSAtIGR5MTIgKiBkeDMxLCBiID0gbnVtYiAvIGRlbm9taW5hdG9yO1xyXG4gICAgICAgIGlmIChhID49IDAgJiYgYSA8PSAxICYmIGIgPj0gMCAmJiBiIDw9IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHg6IHgxICsgYSAqIGR4MTIsXHJcbiAgICAgICAgICAgICAgICB5OiB5MSArIGEgKiBkeTEyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUuaW5mbGF0ZSA9IGZ1bmN0aW9uIChwYWQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSh0aGlzLnggLSBwYWQsIHRoaXMuWCArIHBhZCwgdGhpcy55IC0gcGFkLCB0aGlzLlkgKyBwYWQpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBSZWN0YW5nbGU7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlO1xyXG5mdW5jdGlvbiBtYWtlRWRnZUJldHdlZW4oc291cmNlLCB0YXJnZXQsIGFoKSB7XHJcbiAgICB2YXIgc2kgPSBzb3VyY2UucmF5SW50ZXJzZWN0aW9uKHRhcmdldC5jeCgpLCB0YXJnZXQuY3koKSkgfHwgeyB4OiBzb3VyY2UuY3goKSwgeTogc291cmNlLmN5KCkgfSwgdGkgPSB0YXJnZXQucmF5SW50ZXJzZWN0aW9uKHNvdXJjZS5jeCgpLCBzb3VyY2UuY3koKSkgfHwgeyB4OiB0YXJnZXQuY3goKSwgeTogdGFyZ2V0LmN5KCkgfSwgZHggPSB0aS54IC0gc2kueCwgZHkgPSB0aS55IC0gc2kueSwgbCA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSksIGFsID0gbCAtIGFoO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzb3VyY2VJbnRlcnNlY3Rpb246IHNpLFxyXG4gICAgICAgIHRhcmdldEludGVyc2VjdGlvbjogdGksXHJcbiAgICAgICAgYXJyb3dTdGFydDogeyB4OiBzaS54ICsgYWwgKiBkeCAvIGwsIHk6IHNpLnkgKyBhbCAqIGR5IC8gbCB9XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMubWFrZUVkZ2VCZXR3ZWVuID0gbWFrZUVkZ2VCZXR3ZWVuO1xyXG5mdW5jdGlvbiBtYWtlRWRnZVRvKHMsIHRhcmdldCwgYWgpIHtcclxuICAgIHZhciB0aSA9IHRhcmdldC5yYXlJbnRlcnNlY3Rpb24ocy54LCBzLnkpO1xyXG4gICAgaWYgKCF0aSlcclxuICAgICAgICB0aSA9IHsgeDogdGFyZ2V0LmN4KCksIHk6IHRhcmdldC5jeSgpIH07XHJcbiAgICB2YXIgZHggPSB0aS54IC0gcy54LCBkeSA9IHRpLnkgLSBzLnksIGwgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xyXG4gICAgcmV0dXJuIHsgeDogdGkueCAtIGFoICogZHggLyBsLCB5OiB0aS55IC0gYWggKiBkeSAvIGwgfTtcclxufVxyXG5leHBvcnRzLm1ha2VFZGdlVG8gPSBtYWtlRWRnZVRvO1xyXG52YXIgTm9kZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb2RlKHYsIHIsIHBvcykge1xyXG4gICAgICAgIHRoaXMudiA9IHY7XHJcbiAgICAgICAgdGhpcy5yID0gcjtcclxuICAgICAgICB0aGlzLnBvcyA9IHBvcztcclxuICAgICAgICB0aGlzLnByZXYgPSBtYWtlUkJUcmVlKCk7XHJcbiAgICAgICAgdGhpcy5uZXh0ID0gbWFrZVJCVHJlZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5vZGU7XHJcbn0oKSk7XHJcbnZhciBFdmVudCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBFdmVudChpc09wZW4sIHYsIHBvcykge1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gaXNPcGVuO1xyXG4gICAgICAgIHRoaXMudiA9IHY7XHJcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gRXZlbnQ7XHJcbn0oKSk7XHJcbmZ1bmN0aW9uIGNvbXBhcmVFdmVudHMoYSwgYikge1xyXG4gICAgaWYgKGEucG9zID4gYi5wb3MpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIGlmIChhLnBvcyA8IGIucG9zKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgaWYgKGEuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgaWYgKGIuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gMDtcclxufVxyXG5mdW5jdGlvbiBtYWtlUkJUcmVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyByYnRyZWVfMS5SQlRyZWUoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEucG9zIC0gYi5wb3M7IH0pO1xyXG59XHJcbnZhciB4UmVjdCA9IHtcclxuICAgIGdldENlbnRyZTogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIuY3goKTsgfSxcclxuICAgIGdldE9wZW46IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLnk7IH0sXHJcbiAgICBnZXRDbG9zZTogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIuWTsgfSxcclxuICAgIGdldFNpemU6IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLndpZHRoKCk7IH0sXHJcbiAgICBtYWtlUmVjdDogZnVuY3Rpb24gKG9wZW4sIGNsb3NlLCBjZW50ZXIsIHNpemUpIHsgcmV0dXJuIG5ldyBSZWN0YW5nbGUoY2VudGVyIC0gc2l6ZSAvIDIsIGNlbnRlciArIHNpemUgLyAyLCBvcGVuLCBjbG9zZSk7IH0sXHJcbiAgICBmaW5kTmVpZ2hib3VyczogZmluZFhOZWlnaGJvdXJzXHJcbn07XHJcbnZhciB5UmVjdCA9IHtcclxuICAgIGdldENlbnRyZTogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIuY3koKTsgfSxcclxuICAgIGdldE9wZW46IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLng7IH0sXHJcbiAgICBnZXRDbG9zZTogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIuWDsgfSxcclxuICAgIGdldFNpemU6IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLmhlaWdodCgpOyB9LFxyXG4gICAgbWFrZVJlY3Q6IGZ1bmN0aW9uIChvcGVuLCBjbG9zZSwgY2VudGVyLCBzaXplKSB7IHJldHVybiBuZXcgUmVjdGFuZ2xlKG9wZW4sIGNsb3NlLCBjZW50ZXIgLSBzaXplIC8gMiwgY2VudGVyICsgc2l6ZSAvIDIpOyB9LFxyXG4gICAgZmluZE5laWdoYm91cnM6IGZpbmRZTmVpZ2hib3Vyc1xyXG59O1xyXG5mdW5jdGlvbiBnZW5lcmF0ZUdyb3VwQ29uc3RyYWludHMocm9vdCwgZiwgbWluU2VwLCBpc0NvbnRhaW5lZCkge1xyXG4gICAgaWYgKGlzQ29udGFpbmVkID09PSB2b2lkIDApIHsgaXNDb250YWluZWQgPSBmYWxzZTsgfVxyXG4gICAgdmFyIHBhZGRpbmcgPSByb290LnBhZGRpbmcsIGduID0gdHlwZW9mIHJvb3QuZ3JvdXBzICE9PSAndW5kZWZpbmVkJyA/IHJvb3QuZ3JvdXBzLmxlbmd0aCA6IDAsIGxuID0gdHlwZW9mIHJvb3QubGVhdmVzICE9PSAndW5kZWZpbmVkJyA/IHJvb3QubGVhdmVzLmxlbmd0aCA6IDAsIGNoaWxkQ29uc3RyYWludHMgPSAhZ24gPyBbXVxyXG4gICAgICAgIDogcm9vdC5ncm91cHMucmVkdWNlKGZ1bmN0aW9uIChjY3MsIGcpIHsgcmV0dXJuIGNjcy5jb25jYXQoZ2VuZXJhdGVHcm91cENvbnN0cmFpbnRzKGcsIGYsIG1pblNlcCwgdHJ1ZSkpOyB9LCBbXSksIG4gPSAoaXNDb250YWluZWQgPyAyIDogMCkgKyBsbiArIGduLCB2cyA9IG5ldyBBcnJheShuKSwgcnMgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBhZGQgPSBmdW5jdGlvbiAociwgdikgeyByc1tpXSA9IHI7IHZzW2krK10gPSB2OyB9O1xyXG4gICAgaWYgKGlzQ29udGFpbmVkKSB7XHJcbiAgICAgICAgdmFyIGIgPSByb290LmJvdW5kcywgYyA9IGYuZ2V0Q2VudHJlKGIpLCBzID0gZi5nZXRTaXplKGIpIC8gMiwgb3BlbiA9IGYuZ2V0T3BlbihiKSwgY2xvc2UgPSBmLmdldENsb3NlKGIpLCBtaW4gPSBjIC0gcyArIHBhZGRpbmcgLyAyLCBtYXggPSBjICsgcyAtIHBhZGRpbmcgLyAyO1xyXG4gICAgICAgIHJvb3QubWluVmFyLmRlc2lyZWRQb3NpdGlvbiA9IG1pbjtcclxuICAgICAgICBhZGQoZi5tYWtlUmVjdChvcGVuLCBjbG9zZSwgbWluLCBwYWRkaW5nKSwgcm9vdC5taW5WYXIpO1xyXG4gICAgICAgIHJvb3QubWF4VmFyLmRlc2lyZWRQb3NpdGlvbiA9IG1heDtcclxuICAgICAgICBhZGQoZi5tYWtlUmVjdChvcGVuLCBjbG9zZSwgbWF4LCBwYWRkaW5nKSwgcm9vdC5tYXhWYXIpO1xyXG4gICAgfVxyXG4gICAgaWYgKGxuKVxyXG4gICAgICAgIHJvb3QubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGFkZChsLmJvdW5kcywgbC52YXJpYWJsZSk7IH0pO1xyXG4gICAgaWYgKGduKVxyXG4gICAgICAgIHJvb3QuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgdmFyIGIgPSBnLmJvdW5kcztcclxuICAgICAgICAgICAgYWRkKGYubWFrZVJlY3QoZi5nZXRPcGVuKGIpLCBmLmdldENsb3NlKGIpLCBmLmdldENlbnRyZShiKSwgZi5nZXRTaXplKGIpKSwgZy5taW5WYXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgdmFyIGNzID0gZ2VuZXJhdGVDb25zdHJhaW50cyhycywgdnMsIGYsIG1pblNlcCk7XHJcbiAgICBpZiAoZ24pIHtcclxuICAgICAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHYuY091dCA9IFtdLCB2LmNJbiA9IFtdOyB9KTtcclxuICAgICAgICBjcy5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IGMubGVmdC5jT3V0LnB1c2goYyksIGMucmlnaHQuY0luLnB1c2goYyk7IH0pO1xyXG4gICAgICAgIHJvb3QuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgdmFyIGdhcEFkanVzdG1lbnQgPSAoZy5wYWRkaW5nIC0gZi5nZXRTaXplKGcuYm91bmRzKSkgLyAyO1xyXG4gICAgICAgICAgICBnLm1pblZhci5jSW4uZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gYy5nYXAgKz0gZ2FwQWRqdXN0bWVudDsgfSk7XHJcbiAgICAgICAgICAgIGcubWluVmFyLmNPdXQuZm9yRWFjaChmdW5jdGlvbiAoYykgeyBjLmxlZnQgPSBnLm1heFZhcjsgYy5nYXAgKz0gZ2FwQWRqdXN0bWVudDsgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hpbGRDb25zdHJhaW50cy5jb25jYXQoY3MpO1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlQ29uc3RyYWludHMocnMsIHZhcnMsIHJlY3QsIG1pblNlcCkge1xyXG4gICAgdmFyIGksIG4gPSBycy5sZW5ndGg7XHJcbiAgICB2YXIgTiA9IDIgKiBuO1xyXG4gICAgY29uc29sZS5hc3NlcnQodmFycy5sZW5ndGggPj0gbik7XHJcbiAgICB2YXIgZXZlbnRzID0gbmV3IEFycmF5KE4pO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgIHZhciByID0gcnNbaV07XHJcbiAgICAgICAgdmFyIHYgPSBuZXcgTm9kZSh2YXJzW2ldLCByLCByZWN0LmdldENlbnRyZShyKSk7XHJcbiAgICAgICAgZXZlbnRzW2ldID0gbmV3IEV2ZW50KHRydWUsIHYsIHJlY3QuZ2V0T3BlbihyKSk7XHJcbiAgICAgICAgZXZlbnRzW2kgKyBuXSA9IG5ldyBFdmVudChmYWxzZSwgdiwgcmVjdC5nZXRDbG9zZShyKSk7XHJcbiAgICB9XHJcbiAgICBldmVudHMuc29ydChjb21wYXJlRXZlbnRzKTtcclxuICAgIHZhciBjcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdmFyIHNjYW5saW5lID0gbWFrZVJCVHJlZSgpO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IE47ICsraSkge1xyXG4gICAgICAgIHZhciBlID0gZXZlbnRzW2ldO1xyXG4gICAgICAgIHZhciB2ID0gZS52O1xyXG4gICAgICAgIGlmIChlLmlzT3Blbikge1xyXG4gICAgICAgICAgICBzY2FubGluZS5pbnNlcnQodik7XHJcbiAgICAgICAgICAgIHJlY3QuZmluZE5laWdoYm91cnModiwgc2NhbmxpbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2NhbmxpbmUucmVtb3ZlKHYpO1xyXG4gICAgICAgICAgICB2YXIgbWFrZUNvbnN0cmFpbnQgPSBmdW5jdGlvbiAobCwgcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlcCA9IChyZWN0LmdldFNpemUobC5yKSArIHJlY3QuZ2V0U2l6ZShyLnIpKSAvIDIgKyBtaW5TZXA7XHJcbiAgICAgICAgICAgICAgICBjcy5wdXNoKG5ldyB2cHNjXzEuQ29uc3RyYWludChsLnYsIHIudiwgc2VwKSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciB2aXNpdE5laWdoYm91cnMgPSBmdW5jdGlvbiAoZm9yd2FyZCwgcmV2ZXJzZSwgbWtjb24pIHtcclxuICAgICAgICAgICAgICAgIHZhciB1LCBpdCA9IHZbZm9yd2FyZF0uaXRlcmF0b3IoKTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICgodSA9IGl0W2ZvcndhcmRdKCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWtjb24odSwgdik7XHJcbiAgICAgICAgICAgICAgICAgICAgdVtyZXZlcnNlXS5yZW1vdmUodik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZpc2l0TmVpZ2hib3VycyhcInByZXZcIiwgXCJuZXh0XCIsIGZ1bmN0aW9uICh1LCB2KSB7IHJldHVybiBtYWtlQ29uc3RyYWludCh1LCB2KTsgfSk7XHJcbiAgICAgICAgICAgIHZpc2l0TmVpZ2hib3VycyhcIm5leHRcIiwgXCJwcmV2XCIsIGZ1bmN0aW9uICh1LCB2KSB7IHJldHVybiBtYWtlQ29uc3RyYWludCh2LCB1KTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc29sZS5hc3NlcnQoc2NhbmxpbmUuc2l6ZSA9PT0gMCk7XHJcbiAgICByZXR1cm4gY3M7XHJcbn1cclxuZnVuY3Rpb24gZmluZFhOZWlnaGJvdXJzKHYsIHNjYW5saW5lKSB7XHJcbiAgICB2YXIgZiA9IGZ1bmN0aW9uIChmb3J3YXJkLCByZXZlcnNlKSB7XHJcbiAgICAgICAgdmFyIGl0ID0gc2NhbmxpbmUuZmluZEl0ZXIodik7XHJcbiAgICAgICAgdmFyIHU7XHJcbiAgICAgICAgd2hpbGUgKCh1ID0gaXRbZm9yd2FyZF0oKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIHVvdmVydlggPSB1LnIub3ZlcmxhcFgodi5yKTtcclxuICAgICAgICAgICAgaWYgKHVvdmVydlggPD0gMCB8fCB1b3ZlcnZYIDw9IHUuci5vdmVybGFwWSh2LnIpKSB7XHJcbiAgICAgICAgICAgICAgICB2W2ZvcndhcmRdLmluc2VydCh1KTtcclxuICAgICAgICAgICAgICAgIHVbcmV2ZXJzZV0uaW5zZXJ0KHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1b3ZlcnZYIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGYoXCJuZXh0XCIsIFwicHJldlwiKTtcclxuICAgIGYoXCJwcmV2XCIsIFwibmV4dFwiKTtcclxufVxyXG5mdW5jdGlvbiBmaW5kWU5laWdoYm91cnModiwgc2NhbmxpbmUpIHtcclxuICAgIHZhciBmID0gZnVuY3Rpb24gKGZvcndhcmQsIHJldmVyc2UpIHtcclxuICAgICAgICB2YXIgdSA9IHNjYW5saW5lLmZpbmRJdGVyKHYpW2ZvcndhcmRdKCk7XHJcbiAgICAgICAgaWYgKHUgIT09IG51bGwgJiYgdS5yLm92ZXJsYXBYKHYucikgPiAwKSB7XHJcbiAgICAgICAgICAgIHZbZm9yd2FyZF0uaW5zZXJ0KHUpO1xyXG4gICAgICAgICAgICB1W3JldmVyc2VdLmluc2VydCh2KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgZihcIm5leHRcIiwgXCJwcmV2XCIpO1xyXG4gICAgZihcInByZXZcIiwgXCJuZXh0XCIpO1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlWENvbnN0cmFpbnRzKHJzLCB2YXJzKSB7XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVDb25zdHJhaW50cyhycywgdmFycywgeFJlY3QsIDFlLTYpO1xyXG59XHJcbmV4cG9ydHMuZ2VuZXJhdGVYQ29uc3RyYWludHMgPSBnZW5lcmF0ZVhDb25zdHJhaW50cztcclxuZnVuY3Rpb24gZ2VuZXJhdGVZQ29uc3RyYWludHMocnMsIHZhcnMpIHtcclxuICAgIHJldHVybiBnZW5lcmF0ZUNvbnN0cmFpbnRzKHJzLCB2YXJzLCB5UmVjdCwgMWUtNik7XHJcbn1cclxuZXhwb3J0cy5nZW5lcmF0ZVlDb25zdHJhaW50cyA9IGdlbmVyYXRlWUNvbnN0cmFpbnRzO1xyXG5mdW5jdGlvbiBnZW5lcmF0ZVhHcm91cENvbnN0cmFpbnRzKHJvb3QpIHtcclxuICAgIHJldHVybiBnZW5lcmF0ZUdyb3VwQ29uc3RyYWludHMocm9vdCwgeFJlY3QsIDFlLTYpO1xyXG59XHJcbmV4cG9ydHMuZ2VuZXJhdGVYR3JvdXBDb25zdHJhaW50cyA9IGdlbmVyYXRlWEdyb3VwQ29uc3RyYWludHM7XHJcbmZ1bmN0aW9uIGdlbmVyYXRlWUdyb3VwQ29uc3RyYWludHMocm9vdCkge1xyXG4gICAgcmV0dXJuIGdlbmVyYXRlR3JvdXBDb25zdHJhaW50cyhyb290LCB5UmVjdCwgMWUtNik7XHJcbn1cclxuZXhwb3J0cy5nZW5lcmF0ZVlHcm91cENvbnN0cmFpbnRzID0gZ2VuZXJhdGVZR3JvdXBDb25zdHJhaW50cztcclxuZnVuY3Rpb24gcmVtb3ZlT3ZlcmxhcHMocnMpIHtcclxuICAgIHZhciB2cyA9IHJzLm1hcChmdW5jdGlvbiAocikgeyByZXR1cm4gbmV3IHZwc2NfMS5WYXJpYWJsZShyLmN4KCkpOyB9KTtcclxuICAgIHZhciBjcyA9IGdlbmVyYXRlWENvbnN0cmFpbnRzKHJzLCB2cyk7XHJcbiAgICB2YXIgc29sdmVyID0gbmV3IHZwc2NfMS5Tb2x2ZXIodnMsIGNzKTtcclxuICAgIHNvbHZlci5zb2x2ZSgpO1xyXG4gICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gcnNbaV0uc2V0WENlbnRyZSh2LnBvc2l0aW9uKCkpOyB9KTtcclxuICAgIHZzID0gcnMubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiBuZXcgdnBzY18xLlZhcmlhYmxlKHIuY3koKSk7IH0pO1xyXG4gICAgY3MgPSBnZW5lcmF0ZVlDb25zdHJhaW50cyhycywgdnMpO1xyXG4gICAgc29sdmVyID0gbmV3IHZwc2NfMS5Tb2x2ZXIodnMsIGNzKTtcclxuICAgIHNvbHZlci5zb2x2ZSgpO1xyXG4gICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gcnNbaV0uc2V0WUNlbnRyZSh2LnBvc2l0aW9uKCkpOyB9KTtcclxufVxyXG5leHBvcnRzLnJlbW92ZU92ZXJsYXBzID0gcmVtb3ZlT3ZlcmxhcHM7XHJcbnZhciBJbmRleGVkVmFyaWFibGUgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKEluZGV4ZWRWYXJpYWJsZSwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIEluZGV4ZWRWYXJpYWJsZShpbmRleCwgdykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIDAsIHcpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuaW5kZXggPSBpbmRleDtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gSW5kZXhlZFZhcmlhYmxlO1xyXG59KHZwc2NfMS5WYXJpYWJsZSkpO1xyXG5leHBvcnRzLkluZGV4ZWRWYXJpYWJsZSA9IEluZGV4ZWRWYXJpYWJsZTtcclxudmFyIFByb2plY3Rpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUHJvamVjdGlvbihub2RlcywgZ3JvdXBzLCByb290R3JvdXAsIGNvbnN0cmFpbnRzLCBhdm9pZE92ZXJsYXBzKSB7XHJcbiAgICAgICAgaWYgKHJvb3RHcm91cCA9PT0gdm9pZCAwKSB7IHJvb3RHcm91cCA9IG51bGw7IH1cclxuICAgICAgICBpZiAoY29uc3RyYWludHMgPT09IHZvaWQgMCkgeyBjb25zdHJhaW50cyA9IG51bGw7IH1cclxuICAgICAgICBpZiAoYXZvaWRPdmVybGFwcyA9PT0gdm9pZCAwKSB7IGF2b2lkT3ZlcmxhcHMgPSBmYWxzZTsgfVxyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gZ3JvdXBzO1xyXG4gICAgICAgIHRoaXMucm9vdEdyb3VwID0gcm9vdEdyb3VwO1xyXG4gICAgICAgIHRoaXMuYXZvaWRPdmVybGFwcyA9IGF2b2lkT3ZlcmxhcHM7XHJcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSBub2Rlcy5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHYudmFyaWFibGUgPSBuZXcgSW5kZXhlZFZhcmlhYmxlKGksIDEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChjb25zdHJhaW50cylcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb25zdHJhaW50cyhjb25zdHJhaW50cyk7XHJcbiAgICAgICAgaWYgKGF2b2lkT3ZlcmxhcHMgJiYgcm9vdEdyb3VwICYmIHR5cGVvZiByb290R3JvdXAuZ3JvdXBzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXYud2lkdGggfHwgIXYuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5ib3VuZHMgPSBuZXcgUmVjdGFuZ2xlKHYueCwgdi54LCB2LnksIHYueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHcyID0gdi53aWR0aCAvIDIsIGgyID0gdi5oZWlnaHQgLyAyO1xyXG4gICAgICAgICAgICAgICAgdi5ib3VuZHMgPSBuZXcgUmVjdGFuZ2xlKHYueCAtIHcyLCB2LnggKyB3Miwgdi55IC0gaDIsIHYueSArIGgyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbXB1dGVHcm91cEJvdW5kcyhyb290R3JvdXApO1xyXG4gICAgICAgICAgICB2YXIgaSA9IG5vZGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnZhcmlhYmxlc1tpXSA9IGcubWluVmFyID0gbmV3IEluZGV4ZWRWYXJpYWJsZShpKyssIHR5cGVvZiBnLnN0aWZmbmVzcyAhPT0gXCJ1bmRlZmluZWRcIiA/IGcuc3RpZmZuZXNzIDogMC4wMSk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy52YXJpYWJsZXNbaV0gPSBnLm1heFZhciA9IG5ldyBJbmRleGVkVmFyaWFibGUoaSsrLCB0eXBlb2YgZy5zdGlmZm5lc3MgIT09IFwidW5kZWZpbmVkXCIgPyBnLnN0aWZmbmVzcyA6IDAuMDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVTZXBhcmF0aW9uID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHZwc2NfMS5Db25zdHJhaW50KHRoaXMubm9kZXNbYy5sZWZ0XS52YXJpYWJsZSwgdGhpcy5ub2Rlc1tjLnJpZ2h0XS52YXJpYWJsZSwgYy5nYXAsIHR5cGVvZiBjLmVxdWFsaXR5ICE9PSBcInVuZGVmaW5lZFwiID8gYy5lcXVhbGl0eSA6IGZhbHNlKTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5tYWtlRmVhc2libGUgPSBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLmF2b2lkT3ZlcmxhcHMpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgYXhpcyA9ICd4JywgZGltID0gJ3dpZHRoJztcclxuICAgICAgICBpZiAoYy5heGlzID09PSAneCcpXHJcbiAgICAgICAgICAgIGF4aXMgPSAneScsIGRpbSA9ICdoZWlnaHQnO1xyXG4gICAgICAgIHZhciB2cyA9IGMub2Zmc2V0cy5tYXAoZnVuY3Rpb24gKG8pIHsgcmV0dXJuIF90aGlzLm5vZGVzW28ubm9kZV07IH0pLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbYXhpc10gLSBiW2F4aXNdOyB9KTtcclxuICAgICAgICB2YXIgcCA9IG51bGw7XHJcbiAgICAgICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICBpZiAocCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5leHRQb3MgPSBwW2F4aXNdICsgcFtkaW1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5leHRQb3MgPiB2W2F4aXNdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdltheGlzXSA9IG5leHRQb3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcCA9IHY7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQWxpZ25tZW50ID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciB1ID0gdGhpcy5ub2Rlc1tjLm9mZnNldHNbMF0ubm9kZV0udmFyaWFibGU7XHJcbiAgICAgICAgdGhpcy5tYWtlRmVhc2libGUoYyk7XHJcbiAgICAgICAgdmFyIGNzID0gYy5heGlzID09PSAneCcgPyB0aGlzLnhDb25zdHJhaW50cyA6IHRoaXMueUNvbnN0cmFpbnRzO1xyXG4gICAgICAgIGMub2Zmc2V0cy5zbGljZSgxKS5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gX3RoaXMubm9kZXNbby5ub2RlXS52YXJpYWJsZTtcclxuICAgICAgICAgICAgY3MucHVzaChuZXcgdnBzY18xLkNvbnN0cmFpbnQodSwgdiwgby5vZmZzZXQsIHRydWUpKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVDb25zdHJhaW50cyA9IGZ1bmN0aW9uIChjb25zdHJhaW50cykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGlzU2VwID0gZnVuY3Rpb24gKGMpIHsgcmV0dXJuIHR5cGVvZiBjLnR5cGUgPT09ICd1bmRlZmluZWQnIHx8IGMudHlwZSA9PT0gJ3NlcGFyYXRpb24nOyB9O1xyXG4gICAgICAgIHRoaXMueENvbnN0cmFpbnRzID0gY29uc3RyYWludHNcclxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYy5heGlzID09PSBcInhcIiAmJiBpc1NlcChjKTsgfSlcclxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbiAoYykgeyByZXR1cm4gX3RoaXMuY3JlYXRlU2VwYXJhdGlvbihjKTsgfSk7XHJcbiAgICAgICAgdGhpcy55Q29uc3RyYWludHMgPSBjb25zdHJhaW50c1xyXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLmF4aXMgPT09IFwieVwiICYmIGlzU2VwKGMpOyB9KVxyXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChjKSB7IHJldHVybiBfdGhpcy5jcmVhdGVTZXBhcmF0aW9uKGMpOyB9KTtcclxuICAgICAgICBjb25zdHJhaW50c1xyXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLnR5cGUgPT09ICdhbGlnbm1lbnQnOyB9KVxyXG4gICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gX3RoaXMuY3JlYXRlQWxpZ25tZW50KGMpOyB9KTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5zZXR1cFZhcmlhYmxlc0FuZEJvdW5kcyA9IGZ1bmN0aW9uICh4MCwgeTAsIGRlc2lyZWQsIGdldERlc2lyZWQpIHtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgaWYgKHYuZml4ZWQpIHtcclxuICAgICAgICAgICAgICAgIHYudmFyaWFibGUud2VpZ2h0ID0gdi5maXhlZFdlaWdodCA/IHYuZml4ZWRXZWlnaHQgOiAxMDAwO1xyXG4gICAgICAgICAgICAgICAgZGVzaXJlZFtpXSA9IGdldERlc2lyZWQodik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2LnZhcmlhYmxlLndlaWdodCA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHcgPSAodi53aWR0aCB8fCAwKSAvIDIsIGggPSAodi5oZWlnaHQgfHwgMCkgLyAyO1xyXG4gICAgICAgICAgICB2YXIgaXggPSB4MFtpXSwgaXkgPSB5MFtpXTtcclxuICAgICAgICAgICAgdi5ib3VuZHMgPSBuZXcgUmVjdGFuZ2xlKGl4IC0gdywgaXggKyB3LCBpeSAtIGgsIGl5ICsgaCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUueFByb2plY3QgPSBmdW5jdGlvbiAoeDAsIHkwLCB4KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RHcm91cCAmJiAhKHRoaXMuYXZvaWRPdmVybGFwcyB8fCB0aGlzLnhDb25zdHJhaW50cykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLnByb2plY3QoeDAsIHkwLCB4MCwgeCwgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYucHg7IH0sIHRoaXMueENvbnN0cmFpbnRzLCBnZW5lcmF0ZVhHcm91cENvbnN0cmFpbnRzLCBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5ib3VuZHMuc2V0WENlbnRyZSh4W3YudmFyaWFibGUuaW5kZXhdID0gdi52YXJpYWJsZS5wb3NpdGlvbigpKTsgfSwgZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgdmFyIHhtaW4gPSB4W2cubWluVmFyLmluZGV4XSA9IGcubWluVmFyLnBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIHZhciB4bWF4ID0geFtnLm1heFZhci5pbmRleF0gPSBnLm1heFZhci5wb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgcDIgPSBnLnBhZGRpbmcgLyAyO1xyXG4gICAgICAgICAgICBnLmJvdW5kcy54ID0geG1pbiAtIHAyO1xyXG4gICAgICAgICAgICBnLmJvdW5kcy5YID0geG1heCArIHAyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLnlQcm9qZWN0ID0gZnVuY3Rpb24gKHgwLCB5MCwgeSkge1xyXG4gICAgICAgIGlmICghdGhpcy5yb290R3JvdXAgJiYgIXRoaXMueUNvbnN0cmFpbnRzKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0KHgwLCB5MCwgeTAsIHksIGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnB5OyB9LCB0aGlzLnlDb25zdHJhaW50cywgZ2VuZXJhdGVZR3JvdXBDb25zdHJhaW50cywgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYuYm91bmRzLnNldFlDZW50cmUoeVt2LnZhcmlhYmxlLmluZGV4XSA9IHYudmFyaWFibGUucG9zaXRpb24oKSk7IH0sIGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIHZhciB5bWluID0geVtnLm1pblZhci5pbmRleF0gPSBnLm1pblZhci5wb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgeW1heCA9IHlbZy5tYXhWYXIuaW5kZXhdID0gZy5tYXhWYXIucG9zaXRpb24oKTtcclxuICAgICAgICAgICAgdmFyIHAyID0gZy5wYWRkaW5nIC8gMjtcclxuICAgICAgICAgICAgZy5ib3VuZHMueSA9IHltaW4gLSBwMjtcclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICBnLmJvdW5kcy5ZID0geW1heCArIHAyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLnByb2plY3RGdW5jdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBmdW5jdGlvbiAoeDAsIHkwLCB4KSB7IHJldHVybiBfdGhpcy54UHJvamVjdCh4MCwgeTAsIHgpOyB9LFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoeDAsIHkwLCB5KSB7IHJldHVybiBfdGhpcy55UHJvamVjdCh4MCwgeTAsIHkpOyB9XHJcbiAgICAgICAgXTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5wcm9qZWN0ID0gZnVuY3Rpb24gKHgwLCB5MCwgc3RhcnQsIGRlc2lyZWQsIGdldERlc2lyZWQsIGNzLCBnZW5lcmF0ZUNvbnN0cmFpbnRzLCB1cGRhdGVOb2RlQm91bmRzLCB1cGRhdGVHcm91cEJvdW5kcykge1xyXG4gICAgICAgIHRoaXMuc2V0dXBWYXJpYWJsZXNBbmRCb3VuZHMoeDAsIHkwLCBkZXNpcmVkLCBnZXREZXNpcmVkKTtcclxuICAgICAgICBpZiAodGhpcy5yb290R3JvdXAgJiYgdGhpcy5hdm9pZE92ZXJsYXBzKSB7XHJcbiAgICAgICAgICAgIGNvbXB1dGVHcm91cEJvdW5kcyh0aGlzLnJvb3RHcm91cCk7XHJcbiAgICAgICAgICAgIGNzID0gY3MuY29uY2F0KGdlbmVyYXRlQ29uc3RyYWludHModGhpcy5yb290R3JvdXApKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2x2ZSh0aGlzLnZhcmlhYmxlcywgY3MsIHN0YXJ0LCBkZXNpcmVkKTtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2godXBkYXRlTm9kZUJvdW5kcyk7XHJcbiAgICAgICAgaWYgKHRoaXMucm9vdEdyb3VwICYmIHRoaXMuYXZvaWRPdmVybGFwcykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3Vwcy5mb3JFYWNoKHVwZGF0ZUdyb3VwQm91bmRzKTtcclxuICAgICAgICAgICAgY29tcHV0ZUdyb3VwQm91bmRzKHRoaXMucm9vdEdyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUuc29sdmUgPSBmdW5jdGlvbiAodnMsIGNzLCBzdGFydGluZywgZGVzaXJlZCkge1xyXG4gICAgICAgIHZhciBzb2x2ZXIgPSBuZXcgdnBzY18xLlNvbHZlcih2cywgY3MpO1xyXG4gICAgICAgIHNvbHZlci5zZXRTdGFydGluZ1Bvc2l0aW9ucyhzdGFydGluZyk7XHJcbiAgICAgICAgc29sdmVyLnNldERlc2lyZWRQb3NpdGlvbnMoZGVzaXJlZCk7XHJcbiAgICAgICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFByb2plY3Rpb247XHJcbn0oKSk7XHJcbmV4cG9ydHMuUHJvamVjdGlvbiA9IFByb2plY3Rpb247XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlY3RhbmdsZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgcHF1ZXVlXzEgPSByZXF1aXJlKFwiLi9wcXVldWVcIik7XHJcbnZhciBOZWlnaGJvdXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTmVpZ2hib3VyKGlkLCBkaXN0YW5jZSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTmVpZ2hib3VyO1xyXG59KCkpO1xyXG52YXIgTm9kZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb2RlKGlkKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMubmVpZ2hib3VycyA9IFtdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5vZGU7XHJcbn0oKSk7XHJcbnZhciBRdWV1ZUVudHJ5ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFF1ZXVlRW50cnkobm9kZSwgcHJldiwgZCkge1xyXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgdGhpcy5wcmV2ID0gcHJldjtcclxuICAgICAgICB0aGlzLmQgPSBkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFF1ZXVlRW50cnk7XHJcbn0oKSk7XHJcbnZhciBDYWxjdWxhdG9yID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENhbGN1bGF0b3IobiwgZXMsIGdldFNvdXJjZUluZGV4LCBnZXRUYXJnZXRJbmRleCwgZ2V0TGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5uID0gbjtcclxuICAgICAgICB0aGlzLmVzID0gZXM7XHJcbiAgICAgICAgdGhpcy5uZWlnaGJvdXJzID0gbmV3IEFycmF5KHRoaXMubik7XHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLm47XHJcbiAgICAgICAgd2hpbGUgKGktLSlcclxuICAgICAgICAgICAgdGhpcy5uZWlnaGJvdXJzW2ldID0gbmV3IE5vZGUoaSk7XHJcbiAgICAgICAgaSA9IHRoaXMuZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgdmFyIGUgPSB0aGlzLmVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgdSA9IGdldFNvdXJjZUluZGV4KGUpLCB2ID0gZ2V0VGFyZ2V0SW5kZXgoZSk7XHJcbiAgICAgICAgICAgIHZhciBkID0gZ2V0TGVuZ3RoKGUpO1xyXG4gICAgICAgICAgICB0aGlzLm5laWdoYm91cnNbdV0ubmVpZ2hib3Vycy5wdXNoKG5ldyBOZWlnaGJvdXIodiwgZCkpO1xyXG4gICAgICAgICAgICB0aGlzLm5laWdoYm91cnNbdl0ubmVpZ2hib3Vycy5wdXNoKG5ldyBOZWlnaGJvdXIodSwgZCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIENhbGN1bGF0b3IucHJvdG90eXBlLkRpc3RhbmNlTWF0cml4ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBEID0gbmV3IEFycmF5KHRoaXMubik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm47ICsraSkge1xyXG4gICAgICAgICAgICBEW2ldID0gdGhpcy5kaWprc3RyYU5laWdoYm91cnMoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfTtcclxuICAgIENhbGN1bGF0b3IucHJvdG90eXBlLkRpc3RhbmNlc0Zyb21Ob2RlID0gZnVuY3Rpb24gKHN0YXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlqa3N0cmFOZWlnaGJvdXJzKHN0YXJ0KTtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5QYXRoRnJvbU5vZGVUb05vZGUgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpamtzdHJhTmVpZ2hib3VycyhzdGFydCwgZW5kKTtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5QYXRoRnJvbU5vZGVUb05vZGVXaXRoUHJldkNvc3QgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCwgcHJldkNvc3QpIHtcclxuICAgICAgICB2YXIgcSA9IG5ldyBwcXVldWVfMS5Qcmlvcml0eVF1ZXVlKGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmQgPD0gYi5kOyB9KSwgdSA9IHRoaXMubmVpZ2hib3Vyc1tzdGFydF0sIHF1ID0gbmV3IFF1ZXVlRW50cnkodSwgbnVsbCwgMCksIHZpc2l0ZWRGcm9tID0ge307XHJcbiAgICAgICAgcS5wdXNoKHF1KTtcclxuICAgICAgICB3aGlsZSAoIXEuZW1wdHkoKSkge1xyXG4gICAgICAgICAgICBxdSA9IHEucG9wKCk7XHJcbiAgICAgICAgICAgIHUgPSBxdS5ub2RlO1xyXG4gICAgICAgICAgICBpZiAodS5pZCA9PT0gZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaSA9IHUubmVpZ2hib3Vycy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZWlnaGJvdXIgPSB1Lm5laWdoYm91cnNbaV0sIHYgPSB0aGlzLm5laWdoYm91cnNbbmVpZ2hib3VyLmlkXTtcclxuICAgICAgICAgICAgICAgIGlmIChxdS5wcmV2ICYmIHYuaWQgPT09IHF1LnByZXYubm9kZS5pZClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHZhciB2aWR1aWQgPSB2LmlkICsgJywnICsgdS5pZDtcclxuICAgICAgICAgICAgICAgIGlmICh2aWR1aWQgaW4gdmlzaXRlZEZyb20gJiYgdmlzaXRlZEZyb21bdmlkdWlkXSA8PSBxdS5kKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNjID0gcXUucHJldiA/IHByZXZDb3N0KHF1LnByZXYubm9kZS5pZCwgdS5pZCwgdi5pZCkgOiAwLCB0ID0gcXUuZCArIG5laWdoYm91ci5kaXN0YW5jZSArIGNjO1xyXG4gICAgICAgICAgICAgICAgdmlzaXRlZEZyb21bdmlkdWlkXSA9IHQ7XHJcbiAgICAgICAgICAgICAgICBxLnB1c2gobmV3IFF1ZXVlRW50cnkodiwgcXUsIHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGF0aCA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChxdS5wcmV2KSB7XHJcbiAgICAgICAgICAgIHF1ID0gcXUucHJldjtcclxuICAgICAgICAgICAgcGF0aC5wdXNoKHF1Lm5vZGUuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5kaWprc3RyYU5laWdoYm91cnMgPSBmdW5jdGlvbiAoc3RhcnQsIGRlc3QpIHtcclxuICAgICAgICBpZiAoZGVzdCA9PT0gdm9pZCAwKSB7IGRlc3QgPSAtMTsgfVxyXG4gICAgICAgIHZhciBxID0gbmV3IHBxdWV1ZV8xLlByaW9yaXR5UXVldWUoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEuZCA8PSBiLmQ7IH0pLCBpID0gdGhpcy5uZWlnaGJvdXJzLmxlbmd0aCwgZCA9IG5ldyBBcnJheShpKTtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5uZWlnaGJvdXJzW2ldO1xyXG4gICAgICAgICAgICBub2RlLmQgPSBpID09PSBzdGFydCA/IDAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgICAgIG5vZGUucSA9IHEucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKCFxLmVtcHR5KCkpIHtcclxuICAgICAgICAgICAgdmFyIHUgPSBxLnBvcCgpO1xyXG4gICAgICAgICAgICBkW3UuaWRdID0gdS5kO1xyXG4gICAgICAgICAgICBpZiAodS5pZCA9PT0gZGVzdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gdTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0eXBlb2Ygdi5wcmV2ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGgucHVzaCh2LnByZXYuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSB2LnByZXY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpID0gdS5uZWlnaGJvdXJzLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5laWdoYm91ciA9IHUubmVpZ2hib3Vyc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gdGhpcy5uZWlnaGJvdXJzW25laWdoYm91ci5pZF07XHJcbiAgICAgICAgICAgICAgICB2YXIgdCA9IHUuZCArIG5laWdoYm91ci5kaXN0YW5jZTtcclxuICAgICAgICAgICAgICAgIGlmICh1LmQgIT09IE51bWJlci5NQVhfVkFMVUUgJiYgdi5kID4gdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYuZCA9IHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5wcmV2ID0gdTtcclxuICAgICAgICAgICAgICAgICAgICBxLnJlZHVjZUtleSh2LnEsIHYsIGZ1bmN0aW9uIChlLCBxKSB7IHJldHVybiBlLnEgPSBxOyB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ2FsY3VsYXRvcjtcclxufSgpKTtcclxuZXhwb3J0cy5DYWxjdWxhdG9yID0gQ2FsY3VsYXRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2hvcnRlc3RwYXRocy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgUG9zaXRpb25TdGF0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQb3NpdGlvblN0YXRzKHNjYWxlKSB7XHJcbiAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlO1xyXG4gICAgICAgIHRoaXMuQUIgPSAwO1xyXG4gICAgICAgIHRoaXMuQUQgPSAwO1xyXG4gICAgICAgIHRoaXMuQTIgPSAwO1xyXG4gICAgfVxyXG4gICAgUG9zaXRpb25TdGF0cy5wcm90b3R5cGUuYWRkVmFyaWFibGUgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBhaSA9IHRoaXMuc2NhbGUgLyB2LnNjYWxlO1xyXG4gICAgICAgIHZhciBiaSA9IHYub2Zmc2V0IC8gdi5zY2FsZTtcclxuICAgICAgICB2YXIgd2kgPSB2LndlaWdodDtcclxuICAgICAgICB0aGlzLkFCICs9IHdpICogYWkgKiBiaTtcclxuICAgICAgICB0aGlzLkFEICs9IHdpICogYWkgKiB2LmRlc2lyZWRQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLkEyICs9IHdpICogYWkgKiBhaTtcclxuICAgIH07XHJcbiAgICBQb3NpdGlvblN0YXRzLnByb3RvdHlwZS5nZXRQb3NuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5BRCAtIHRoaXMuQUIpIC8gdGhpcy5BMjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUG9zaXRpb25TdGF0cztcclxufSgpKTtcclxuZXhwb3J0cy5Qb3NpdGlvblN0YXRzID0gUG9zaXRpb25TdGF0cztcclxudmFyIENvbnN0cmFpbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ29uc3RyYWludChsZWZ0LCByaWdodCwgZ2FwLCBlcXVhbGl0eSkge1xyXG4gICAgICAgIGlmIChlcXVhbGl0eSA9PT0gdm9pZCAwKSB7IGVxdWFsaXR5ID0gZmFsc2U7IH1cclxuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xyXG4gICAgICAgIHRoaXMucmlnaHQgPSByaWdodDtcclxuICAgICAgICB0aGlzLmdhcCA9IGdhcDtcclxuICAgICAgICB0aGlzLmVxdWFsaXR5ID0gZXF1YWxpdHk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnVuc2F0aXNmaWFibGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xyXG4gICAgICAgIHRoaXMucmlnaHQgPSByaWdodDtcclxuICAgICAgICB0aGlzLmdhcCA9IGdhcDtcclxuICAgICAgICB0aGlzLmVxdWFsaXR5ID0gZXF1YWxpdHk7XHJcbiAgICB9XHJcbiAgICBDb25zdHJhaW50LnByb3RvdHlwZS5zbGFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bnNhdGlzZmlhYmxlID8gTnVtYmVyLk1BWF9WQUxVRVxyXG4gICAgICAgICAgICA6IHRoaXMucmlnaHQuc2NhbGUgKiB0aGlzLnJpZ2h0LnBvc2l0aW9uKCkgLSB0aGlzLmdhcFxyXG4gICAgICAgICAgICAgICAgLSB0aGlzLmxlZnQuc2NhbGUgKiB0aGlzLmxlZnQucG9zaXRpb24oKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ29uc3RyYWludDtcclxufSgpKTtcclxuZXhwb3J0cy5Db25zdHJhaW50ID0gQ29uc3RyYWludDtcclxudmFyIFZhcmlhYmxlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZhcmlhYmxlKGRlc2lyZWRQb3NpdGlvbiwgd2VpZ2h0LCBzY2FsZSkge1xyXG4gICAgICAgIGlmICh3ZWlnaHQgPT09IHZvaWQgMCkgeyB3ZWlnaHQgPSAxOyB9XHJcbiAgICAgICAgaWYgKHNjYWxlID09PSB2b2lkIDApIHsgc2NhbGUgPSAxOyB9XHJcbiAgICAgICAgdGhpcy5kZXNpcmVkUG9zaXRpb24gPSBkZXNpcmVkUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy53ZWlnaHQgPSB3ZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcclxuICAgIH1cclxuICAgIFZhcmlhYmxlLnByb3RvdHlwZS5kZmR2ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAyLjAgKiB0aGlzLndlaWdodCAqICh0aGlzLnBvc2l0aW9uKCkgLSB0aGlzLmRlc2lyZWRQb3NpdGlvbik7XHJcbiAgICB9O1xyXG4gICAgVmFyaWFibGUucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5ibG9jay5wcy5zY2FsZSAqIHRoaXMuYmxvY2sucG9zbiArIHRoaXMub2Zmc2V0KSAvIHRoaXMuc2NhbGU7XHJcbiAgICB9O1xyXG4gICAgVmFyaWFibGUucHJvdG90eXBlLnZpc2l0TmVpZ2hib3VycyA9IGZ1bmN0aW9uIChwcmV2LCBmKSB7XHJcbiAgICAgICAgdmFyIGZmID0gZnVuY3Rpb24gKGMsIG5leHQpIHsgcmV0dXJuIGMuYWN0aXZlICYmIHByZXYgIT09IG5leHQgJiYgZihjLCBuZXh0KTsgfTtcclxuICAgICAgICB0aGlzLmNPdXQuZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gZmYoYywgYy5yaWdodCk7IH0pO1xyXG4gICAgICAgIHRoaXMuY0luLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGZmKGMsIGMubGVmdCk7IH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBWYXJpYWJsZTtcclxufSgpKTtcclxuZXhwb3J0cy5WYXJpYWJsZSA9IFZhcmlhYmxlO1xyXG52YXIgQmxvY2sgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQmxvY2sodikge1xyXG4gICAgICAgIHRoaXMudmFycyA9IFtdO1xyXG4gICAgICAgIHYub2Zmc2V0ID0gMDtcclxuICAgICAgICB0aGlzLnBzID0gbmV3IFBvc2l0aW9uU3RhdHModi5zY2FsZSk7XHJcbiAgICAgICAgdGhpcy5hZGRWYXJpYWJsZSh2KTtcclxuICAgIH1cclxuICAgIEJsb2NrLnByb3RvdHlwZS5hZGRWYXJpYWJsZSA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdi5ibG9jayA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy52YXJzLnB1c2godik7XHJcbiAgICAgICAgdGhpcy5wcy5hZGRWYXJpYWJsZSh2KTtcclxuICAgICAgICB0aGlzLnBvc24gPSB0aGlzLnBzLmdldFBvc24oKTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUudXBkYXRlV2VpZ2h0ZWRQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnBzLkFCID0gdGhpcy5wcy5BRCA9IHRoaXMucHMuQTIgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdGhpcy52YXJzLmxlbmd0aDsgaSA8IG47ICsraSlcclxuICAgICAgICAgICAgdGhpcy5wcy5hZGRWYXJpYWJsZSh0aGlzLnZhcnNbaV0pO1xyXG4gICAgICAgIHRoaXMucG9zbiA9IHRoaXMucHMuZ2V0UG9zbigpO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5jb21wdXRlX2xtID0gZnVuY3Rpb24gKHYsIHUsIHBvc3RBY3Rpb24pIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBkZmR2ID0gdi5kZmR2KCk7XHJcbiAgICAgICAgdi52aXNpdE5laWdoYm91cnModSwgZnVuY3Rpb24gKGMsIG5leHQpIHtcclxuICAgICAgICAgICAgdmFyIF9kZmR2ID0gX3RoaXMuY29tcHV0ZV9sbShuZXh0LCB2LCBwb3N0QWN0aW9uKTtcclxuICAgICAgICAgICAgaWYgKG5leHQgPT09IGMucmlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGRmZHYgKz0gX2RmZHYgKiBjLmxlZnQuc2NhbGU7XHJcbiAgICAgICAgICAgICAgICBjLmxtID0gX2RmZHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZmR2ICs9IF9kZmR2ICogYy5yaWdodC5zY2FsZTtcclxuICAgICAgICAgICAgICAgIGMubG0gPSAtX2RmZHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcG9zdEFjdGlvbihjKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZGZkdiAvIHYuc2NhbGU7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLnBvcHVsYXRlU3BsaXRCbG9jayA9IGZ1bmN0aW9uICh2LCBwcmV2KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2LnZpc2l0TmVpZ2hib3VycyhwcmV2LCBmdW5jdGlvbiAoYywgbmV4dCkge1xyXG4gICAgICAgICAgICBuZXh0Lm9mZnNldCA9IHYub2Zmc2V0ICsgKG5leHQgPT09IGMucmlnaHQgPyBjLmdhcCA6IC1jLmdhcCk7XHJcbiAgICAgICAgICAgIF90aGlzLmFkZFZhcmlhYmxlKG5leHQpO1xyXG4gICAgICAgICAgICBfdGhpcy5wb3B1bGF0ZVNwbGl0QmxvY2sobmV4dCwgdik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLnRyYXZlcnNlID0gZnVuY3Rpb24gKHZpc2l0LCBhY2MsIHYsIHByZXYpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICh2ID09PSB2b2lkIDApIHsgdiA9IHRoaXMudmFyc1swXTsgfVxyXG4gICAgICAgIGlmIChwcmV2ID09PSB2b2lkIDApIHsgcHJldiA9IG51bGw7IH1cclxuICAgICAgICB2LnZpc2l0TmVpZ2hib3VycyhwcmV2LCBmdW5jdGlvbiAoYywgbmV4dCkge1xyXG4gICAgICAgICAgICBhY2MucHVzaCh2aXNpdChjKSk7XHJcbiAgICAgICAgICAgIF90aGlzLnRyYXZlcnNlKHZpc2l0LCBhY2MsIG5leHQsIHYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5maW5kTWluTE0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZV9sbSh0aGlzLnZhcnNbMF0sIG51bGwsIGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgIGlmICghYy5lcXVhbGl0eSAmJiAobSA9PT0gbnVsbCB8fCBjLmxtIDwgbS5sbSkpXHJcbiAgICAgICAgICAgICAgICBtID0gYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuZmluZE1pbkxNQmV0d2VlbiA9IGZ1bmN0aW9uIChsdiwgcnYpIHtcclxuICAgICAgICB0aGlzLmNvbXB1dGVfbG0obHYsIG51bGwsIGZ1bmN0aW9uICgpIHsgfSk7XHJcbiAgICAgICAgdmFyIG0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZmluZFBhdGgobHYsIG51bGwsIHJ2LCBmdW5jdGlvbiAoYywgbmV4dCkge1xyXG4gICAgICAgICAgICBpZiAoIWMuZXF1YWxpdHkgJiYgYy5yaWdodCA9PT0gbmV4dCAmJiAobSA9PT0gbnVsbCB8fCBjLmxtIDwgbS5sbSkpXHJcbiAgICAgICAgICAgICAgICBtID0gYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuZmluZFBhdGggPSBmdW5jdGlvbiAodiwgcHJldiwgdG8sIHZpc2l0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgZW5kRm91bmQgPSBmYWxzZTtcclxuICAgICAgICB2LnZpc2l0TmVpZ2hib3VycyhwcmV2LCBmdW5jdGlvbiAoYywgbmV4dCkge1xyXG4gICAgICAgICAgICBpZiAoIWVuZEZvdW5kICYmIChuZXh0ID09PSB0byB8fCBfdGhpcy5maW5kUGF0aChuZXh0LCB2LCB0bywgdmlzaXQpKSkge1xyXG4gICAgICAgICAgICAgICAgZW5kRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmlzaXQoYywgbmV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZW5kRm91bmQ7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLmlzQWN0aXZlRGlyZWN0ZWRQYXRoQmV0d2VlbiA9IGZ1bmN0aW9uICh1LCB2KSB7XHJcbiAgICAgICAgaWYgKHUgPT09IHYpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIHZhciBpID0gdS5jT3V0Lmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gdS5jT3V0W2ldO1xyXG4gICAgICAgICAgICBpZiAoYy5hY3RpdmUgJiYgdGhpcy5pc0FjdGl2ZURpcmVjdGVkUGF0aEJldHdlZW4oYy5yaWdodCwgdikpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnNwbGl0ID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICBjLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBbQmxvY2suY3JlYXRlU3BsaXRCbG9jayhjLmxlZnQpLCBCbG9jay5jcmVhdGVTcGxpdEJsb2NrKGMucmlnaHQpXTtcclxuICAgIH07XHJcbiAgICBCbG9jay5jcmVhdGVTcGxpdEJsb2NrID0gZnVuY3Rpb24gKHN0YXJ0VmFyKSB7XHJcbiAgICAgICAgdmFyIGIgPSBuZXcgQmxvY2soc3RhcnRWYXIpO1xyXG4gICAgICAgIGIucG9wdWxhdGVTcGxpdEJsb2NrKHN0YXJ0VmFyLCBudWxsKTtcclxuICAgICAgICByZXR1cm4gYjtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuc3BsaXRCZXR3ZWVuID0gZnVuY3Rpb24gKHZsLCB2cikge1xyXG4gICAgICAgIHZhciBjID0gdGhpcy5maW5kTWluTE1CZXR3ZWVuKHZsLCB2cik7XHJcbiAgICAgICAgaWYgKGMgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIGJzID0gQmxvY2suc3BsaXQoYyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IGNvbnN0cmFpbnQ6IGMsIGxiOiBic1swXSwgcmI6IGJzWzFdIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5tZXJnZUFjcm9zcyA9IGZ1bmN0aW9uIChiLCBjLCBkaXN0KSB7XHJcbiAgICAgICAgYy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYi52YXJzLmxlbmd0aDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdiA9IGIudmFyc1tpXTtcclxuICAgICAgICAgICAgdi5vZmZzZXQgKz0gZGlzdDtcclxuICAgICAgICAgICAgdGhpcy5hZGRWYXJpYWJsZSh2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3NuID0gdGhpcy5wcy5nZXRQb3NuKCk7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLmNvc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHN1bSA9IDAsIGkgPSB0aGlzLnZhcnMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHYgPSB0aGlzLnZhcnNbaV0sIGQgPSB2LnBvc2l0aW9uKCkgLSB2LmRlc2lyZWRQb3NpdGlvbjtcclxuICAgICAgICAgICAgc3VtICs9IGQgKiBkICogdi53ZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEJsb2NrO1xyXG59KCkpO1xyXG5leHBvcnRzLkJsb2NrID0gQmxvY2s7XHJcbnZhciBCbG9ja3MgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQmxvY2tzKHZzKSB7XHJcbiAgICAgICAgdGhpcy52cyA9IHZzO1xyXG4gICAgICAgIHZhciBuID0gdnMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubGlzdCA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICB3aGlsZSAobi0tKSB7XHJcbiAgICAgICAgICAgIHZhciBiID0gbmV3IEJsb2NrKHZzW25dKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0W25dID0gYjtcclxuICAgICAgICAgICAgYi5ibG9ja0luZCA9IG47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQmxvY2tzLnByb3RvdHlwZS5jb3N0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdW0gPSAwLCBpID0gdGhpcy5saXN0Lmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKVxyXG4gICAgICAgICAgICBzdW0gKz0gdGhpcy5saXN0W2ldLmNvc3QoKTtcclxuICAgICAgICByZXR1cm4gc3VtO1xyXG4gICAgfTtcclxuICAgIEJsb2Nrcy5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICBiLmJsb2NrSW5kID0gdGhpcy5saXN0Lmxlbmd0aDtcclxuICAgICAgICB0aGlzLmxpc3QucHVzaChiKTtcclxuICAgIH07XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChiKSB7XHJcbiAgICAgICAgdmFyIGxhc3QgPSB0aGlzLmxpc3QubGVuZ3RoIC0gMTtcclxuICAgICAgICB2YXIgc3dhcEJsb2NrID0gdGhpcy5saXN0W2xhc3RdO1xyXG4gICAgICAgIHRoaXMubGlzdC5sZW5ndGggPSBsYXN0O1xyXG4gICAgICAgIGlmIChiICE9PSBzd2FwQmxvY2spIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0W2IuYmxvY2tJbmRdID0gc3dhcEJsb2NrO1xyXG4gICAgICAgICAgICBzd2FwQmxvY2suYmxvY2tJbmQgPSBiLmJsb2NrSW5kO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICB2YXIgbCA9IGMubGVmdC5ibG9jaywgciA9IGMucmlnaHQuYmxvY2s7XHJcbiAgICAgICAgdmFyIGRpc3QgPSBjLnJpZ2h0Lm9mZnNldCAtIGMubGVmdC5vZmZzZXQgLSBjLmdhcDtcclxuICAgICAgICBpZiAobC52YXJzLmxlbmd0aCA8IHIudmFycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgci5tZXJnZUFjcm9zcyhsLCBjLCBkaXN0KTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUobCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsLm1lcmdlQWNyb3NzKHIsIGMsIC1kaXN0KTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUocik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIEJsb2Nrcy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZik7XHJcbiAgICB9O1xyXG4gICAgQmxvY2tzLnByb3RvdHlwZS51cGRhdGVCbG9ja1Bvc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoYikgeyByZXR1cm4gYi51cGRhdGVXZWlnaHRlZFBvc2l0aW9uKCk7IH0pO1xyXG4gICAgfTtcclxuICAgIEJsb2Nrcy5wcm90b3R5cGUuc3BsaXQgPSBmdW5jdGlvbiAoaW5hY3RpdmUpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQmxvY2tQb3NpdGlvbnMoKTtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoYikge1xyXG4gICAgICAgICAgICB2YXIgdiA9IGIuZmluZE1pbkxNKCk7XHJcbiAgICAgICAgICAgIGlmICh2ICE9PSBudWxsICYmIHYubG0gPCBTb2x2ZXIuTEFHUkFOR0lBTl9UT0xFUkFOQ0UpIHtcclxuICAgICAgICAgICAgICAgIGIgPSB2LmxlZnQuYmxvY2s7XHJcbiAgICAgICAgICAgICAgICBCbG9jay5zcGxpdCh2KS5mb3JFYWNoKGZ1bmN0aW9uIChuYikgeyByZXR1cm4gX3RoaXMuaW5zZXJ0KG5iKTsgfSk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5yZW1vdmUoYik7XHJcbiAgICAgICAgICAgICAgICBpbmFjdGl2ZS5wdXNoKHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEJsb2NrcztcclxufSgpKTtcclxuZXhwb3J0cy5CbG9ja3MgPSBCbG9ja3M7XHJcbnZhciBTb2x2ZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gU29sdmVyKHZzLCBjcykge1xyXG4gICAgICAgIHRoaXMudnMgPSB2cztcclxuICAgICAgICB0aGlzLmNzID0gY3M7XHJcbiAgICAgICAgdGhpcy52cyA9IHZzO1xyXG4gICAgICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgdi5jSW4gPSBbXSwgdi5jT3V0ID0gW107XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jcyA9IGNzO1xyXG4gICAgICAgIGNzLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgICAgYy5sZWZ0LmNPdXQucHVzaChjKTtcclxuICAgICAgICAgICAgYy5yaWdodC5jSW4ucHVzaChjKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluYWN0aXZlID0gY3MubWFwKGZ1bmN0aW9uIChjKSB7IGMuYWN0aXZlID0gZmFsc2U7IHJldHVybiBjOyB9KTtcclxuICAgICAgICB0aGlzLmJzID0gbnVsbDtcclxuICAgIH1cclxuICAgIFNvbHZlci5wcm90b3R5cGUuY29zdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5icy5jb3N0KCk7XHJcbiAgICB9O1xyXG4gICAgU29sdmVyLnByb3RvdHlwZS5zZXRTdGFydGluZ1Bvc2l0aW9ucyA9IGZ1bmN0aW9uIChwcykge1xyXG4gICAgICAgIHRoaXMuaW5hY3RpdmUgPSB0aGlzLmNzLm1hcChmdW5jdGlvbiAoYykgeyBjLmFjdGl2ZSA9IGZhbHNlOyByZXR1cm4gYzsgfSk7XHJcbiAgICAgICAgdGhpcy5icyA9IG5ldyBCbG9ja3ModGhpcy52cyk7XHJcbiAgICAgICAgdGhpcy5icy5mb3JFYWNoKGZ1bmN0aW9uIChiLCBpKSB7IHJldHVybiBiLnBvc24gPSBwc1tpXTsgfSk7XHJcbiAgICB9O1xyXG4gICAgU29sdmVyLnByb3RvdHlwZS5zZXREZXNpcmVkUG9zaXRpb25zID0gZnVuY3Rpb24gKHBzKSB7XHJcbiAgICAgICAgdGhpcy52cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiB2LmRlc2lyZWRQb3NpdGlvbiA9IHBzW2ldOyB9KTtcclxuICAgIH07XHJcbiAgICBTb2x2ZXIucHJvdG90eXBlLm1vc3RWaW9sYXRlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbWluU2xhY2sgPSBOdW1iZXIuTUFYX1ZBTFVFLCB2ID0gbnVsbCwgbCA9IHRoaXMuaW5hY3RpdmUsIG4gPSBsLmxlbmd0aCwgZGVsZXRlUG9pbnQgPSBuO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gbFtpXTtcclxuICAgICAgICAgICAgaWYgKGMudW5zYXRpc2ZpYWJsZSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB2YXIgc2xhY2sgPSBjLnNsYWNrKCk7XHJcbiAgICAgICAgICAgIGlmIChjLmVxdWFsaXR5IHx8IHNsYWNrIDwgbWluU2xhY2spIHtcclxuICAgICAgICAgICAgICAgIG1pblNsYWNrID0gc2xhY2s7XHJcbiAgICAgICAgICAgICAgICB2ID0gYztcclxuICAgICAgICAgICAgICAgIGRlbGV0ZVBvaW50ID0gaTtcclxuICAgICAgICAgICAgICAgIGlmIChjLmVxdWFsaXR5KVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZWxldGVQb2ludCAhPT0gbiAmJlxyXG4gICAgICAgICAgICAobWluU2xhY2sgPCBTb2x2ZXIuWkVST19VUFBFUkJPVU5EICYmICF2LmFjdGl2ZSB8fCB2LmVxdWFsaXR5KSkge1xyXG4gICAgICAgICAgICBsW2RlbGV0ZVBvaW50XSA9IGxbbiAtIDFdO1xyXG4gICAgICAgICAgICBsLmxlbmd0aCA9IG4gLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdjtcclxuICAgIH07XHJcbiAgICBTb2x2ZXIucHJvdG90eXBlLnNhdGlzZnkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnMgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmJzID0gbmV3IEJsb2Nrcyh0aGlzLnZzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5icy5zcGxpdCh0aGlzLmluYWN0aXZlKTtcclxuICAgICAgICB2YXIgdiA9IG51bGw7XHJcbiAgICAgICAgd2hpbGUgKCh2ID0gdGhpcy5tb3N0VmlvbGF0ZWQoKSkgJiYgKHYuZXF1YWxpdHkgfHwgdi5zbGFjaygpIDwgU29sdmVyLlpFUk9fVVBQRVJCT1VORCAmJiAhdi5hY3RpdmUpKSB7XHJcbiAgICAgICAgICAgIHZhciBsYiA9IHYubGVmdC5ibG9jaywgcmIgPSB2LnJpZ2h0LmJsb2NrO1xyXG4gICAgICAgICAgICBpZiAobGIgIT09IHJiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJzLm1lcmdlKHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxiLmlzQWN0aXZlRGlyZWN0ZWRQYXRoQmV0d2Vlbih2LnJpZ2h0LCB2LmxlZnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi51bnNhdGlzZmlhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBzcGxpdCA9IGxiLnNwbGl0QmV0d2Vlbih2LmxlZnQsIHYucmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icy5pbnNlcnQoc3BsaXQubGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnMuaW5zZXJ0KHNwbGl0LnJiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJzLnJlbW92ZShsYik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmFjdGl2ZS5wdXNoKHNwbGl0LmNvbnN0cmFpbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi51bnNhdGlzZmlhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2LnNsYWNrKCkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5hY3RpdmUucHVzaCh2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnMubWVyZ2Uodik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgU29sdmVyLnByb3RvdHlwZS5zb2x2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNhdGlzZnkoKTtcclxuICAgICAgICB2YXIgbGFzdGNvc3QgPSBOdW1iZXIuTUFYX1ZBTFVFLCBjb3N0ID0gdGhpcy5icy5jb3N0KCk7XHJcbiAgICAgICAgd2hpbGUgKE1hdGguYWJzKGxhc3Rjb3N0IC0gY29zdCkgPiAwLjAwMDEpIHtcclxuICAgICAgICAgICAgdGhpcy5zYXRpc2Z5KCk7XHJcbiAgICAgICAgICAgIGxhc3Rjb3N0ID0gY29zdDtcclxuICAgICAgICAgICAgY29zdCA9IHRoaXMuYnMuY29zdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29zdDtcclxuICAgIH07XHJcbiAgICBTb2x2ZXIuTEFHUkFOR0lBTl9UT0xFUkFOQ0UgPSAtMWUtNDtcclxuICAgIFNvbHZlci5aRVJPX1VQUEVSQk9VTkQgPSAtMWUtMTA7XHJcbiAgICByZXR1cm4gU29sdmVyO1xyXG59KCkpO1xyXG5leHBvcnRzLlNvbHZlciA9IFNvbHZlcjtcclxuZnVuY3Rpb24gcmVtb3ZlT3ZlcmxhcEluT25lRGltZW5zaW9uKHNwYW5zLCBsb3dlckJvdW5kLCB1cHBlckJvdW5kKSB7XHJcbiAgICB2YXIgdnMgPSBzcGFucy5tYXAoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIG5ldyBWYXJpYWJsZShzLmRlc2lyZWRDZW50ZXIpOyB9KTtcclxuICAgIHZhciBjcyA9IFtdO1xyXG4gICAgdmFyIG4gPSBzcGFucy5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG4gLSAxOyBpKyspIHtcclxuICAgICAgICB2YXIgbGVmdCA9IHNwYW5zW2ldLCByaWdodCA9IHNwYW5zW2kgKyAxXTtcclxuICAgICAgICBjcy5wdXNoKG5ldyBDb25zdHJhaW50KHZzW2ldLCB2c1tpICsgMV0sIChsZWZ0LnNpemUgKyByaWdodC5zaXplKSAvIDIpKTtcclxuICAgIH1cclxuICAgIHZhciBsZWZ0TW9zdCA9IHZzWzBdLCByaWdodE1vc3QgPSB2c1tuIC0gMV0sIGxlZnRNb3N0U2l6ZSA9IHNwYW5zWzBdLnNpemUgLyAyLCByaWdodE1vc3RTaXplID0gc3BhbnNbbiAtIDFdLnNpemUgLyAyO1xyXG4gICAgdmFyIHZMb3dlciA9IG51bGwsIHZVcHBlciA9IG51bGw7XHJcbiAgICBpZiAobG93ZXJCb3VuZCkge1xyXG4gICAgICAgIHZMb3dlciA9IG5ldyBWYXJpYWJsZShsb3dlckJvdW5kLCBsZWZ0TW9zdC53ZWlnaHQgKiAxMDAwKTtcclxuICAgICAgICB2cy5wdXNoKHZMb3dlcik7XHJcbiAgICAgICAgY3MucHVzaChuZXcgQ29uc3RyYWludCh2TG93ZXIsIGxlZnRNb3N0LCBsZWZ0TW9zdFNpemUpKTtcclxuICAgIH1cclxuICAgIGlmICh1cHBlckJvdW5kKSB7XHJcbiAgICAgICAgdlVwcGVyID0gbmV3IFZhcmlhYmxlKHVwcGVyQm91bmQsIHJpZ2h0TW9zdC53ZWlnaHQgKiAxMDAwKTtcclxuICAgICAgICB2cy5wdXNoKHZVcHBlcik7XHJcbiAgICAgICAgY3MucHVzaChuZXcgQ29uc3RyYWludChyaWdodE1vc3QsIHZVcHBlciwgcmlnaHRNb3N0U2l6ZSkpO1xyXG4gICAgfVxyXG4gICAgdmFyIHNvbHZlciA9IG5ldyBTb2x2ZXIodnMsIGNzKTtcclxuICAgIHNvbHZlci5zb2x2ZSgpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXdDZW50ZXJzOiB2cy5zbGljZSgwLCBzcGFucy5sZW5ndGgpLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gdi5wb3NpdGlvbigpOyB9KSxcclxuICAgICAgICBsb3dlckJvdW5kOiB2TG93ZXIgPyB2TG93ZXIucG9zaXRpb24oKSA6IGxlZnRNb3N0LnBvc2l0aW9uKCkgLSBsZWZ0TW9zdFNpemUsXHJcbiAgICAgICAgdXBwZXJCb3VuZDogdlVwcGVyID8gdlVwcGVyLnBvc2l0aW9uKCkgOiByaWdodE1vc3QucG9zaXRpb24oKSArIHJpZ2h0TW9zdFNpemVcclxuICAgIH07XHJcbn1cclxuZXhwb3J0cy5yZW1vdmVPdmVybGFwSW5PbmVEaW1lbnNpb24gPSByZW1vdmVPdmVybGFwSW5PbmVEaW1lbnNpb247XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZwc2MuanMubWFwIl19

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("webcola"));
	else if(typeof define === 'function' && define.amd)
		define(["webcola"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeCola"] = factory(require("webcola"));
	else
		root["cytoscapeCola"] = factory(root["webcola"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var assign = __webpack_require__(1);
var defaults = __webpack_require__(2);
var cola = __webpack_require__(5) || (typeof window !== 'undefined' ? window.cola : null);
var raf = __webpack_require__(4);
var isString = function isString(o) {
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof('');
};
var isNumber = function isNumber(o) {
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof(0);
};
var isObject = function isObject(o) {
  return o != null && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof({});
};
var isFunction = function isFunction(o) {
  return o != null && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof(function () {});
};
var nop = function nop() {};

var getOptVal = function getOptVal(val, ele) {
  if (isFunction(val)) {
    var fn = val;
    return fn.apply(ele, [ele]);
  } else {
    return val;
  }
};

// constructor
// options : object containing layout options
function ColaLayout(options) {
  this.options = assign({}, defaults, options);
}

// runs the layout
ColaLayout.prototype.run = function () {
  var layout = this;
  var options = this.options;

  layout.manuallyStopped = false;

  var cy = options.cy; // cy is automatically populated for us in the constructor
  var eles = options.eles;
  var nodes = eles.nodes();
  var edges = eles.edges();
  var ready = false;

  var isParent = function isParent(ele) {
    return ele.isParent();
  };

  var parentNodes = nodes.filter(isParent);

  var nonparentNodes = nodes.subtract(parentNodes);

  var bb = options.boundingBox || { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  if (bb.x2 === undefined) {
    bb.x2 = bb.x1 + bb.w;
  }
  if (bb.w === undefined) {
    bb.w = bb.x2 - bb.x1;
  }
  if (bb.y2 === undefined) {
    bb.y2 = bb.y1 + bb.h;
  }
  if (bb.h === undefined) {
    bb.h = bb.y2 - bb.y1;
  }

  var updateNodePositions = function updateNodePositions() {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var dimensions = node.layoutDimensions(options);
      var scratch = node.scratch('cola');

      // update node dims
      if (!scratch.updatedDims) {
        var padding = getOptVal(options.nodeSpacing, node);

        scratch.width = dimensions.w + 2 * padding;
        scratch.height = dimensions.h + 2 * padding;
      }
    }

    nodes.positions(function (node) {
      var scratch = node.scratch().cola;
      var retPos = void 0;

      if (!node.grabbed() && nonparentNodes.contains(node)) {
        retPos = {
          x: bb.x1 + scratch.x,
          y: bb.y1 + scratch.y
        };

        if (!isNumber(retPos.x) || !isNumber(retPos.y)) {
          retPos = undefined;
        }
      }

      return retPos;
    });

    nodes.updateCompoundBounds(); // because the way this layout sets positions is buggy for some reason; ref #878

    if (!ready) {
      onReady();
      ready = true;
    }

    if (options.fit) {
      cy.fit(options.padding);
    }
  };

  var onDone = function onDone() {
    if (options.ungrabifyWhileSimulating) {
      grabbableNodes.grabify();
    }

    cy.off('destroy', destroyHandler);

    nodes.off('grab free position', grabHandler);
    nodes.off('lock unlock', lockHandler);

    // trigger layoutstop when the layout stops (e.g. finishes)
    layout.one('layoutstop', options.stop);
    layout.trigger({ type: 'layoutstop', layout: layout });
  };

  var onReady = function onReady() {
    // trigger layoutready when each node has had its position set at least once
    layout.one('layoutready', options.ready);
    layout.trigger({ type: 'layoutready', layout: layout });
  };

  var ticksPerFrame = options.refresh;

  if (options.refresh < 0) {
    ticksPerFrame = 1;
  } else {
    ticksPerFrame = Math.max(1, ticksPerFrame); // at least 1
  }

  var adaptor = layout.adaptor = cola.adaptor({
    trigger: function trigger(e) {
      // on sim event
      var TICK = cola.EventType ? cola.EventType.tick : null;
      var END = cola.EventType ? cola.EventType.end : null;

      switch (e.type) {
        case 'tick':
        case TICK:
          if (options.animate) {
            updateNodePositions();
          }
          break;

        case 'end':
        case END:
          updateNodePositions();
          if (!options.infinite) {
            onDone();
          }
          break;
      }
    },

    kick: function kick() {
      // kick off the simulation
      //let skip = 0;

      var inftick = function inftick() {
        if (layout.manuallyStopped) {
          onDone();

          return true;
        }

        var ret = adaptor.tick();

        if (ret && options.infinite) {
          // resume layout if done
          adaptor.resume(); // resume => new kick
        }

        return ret; // allow regular finish b/c of new kick
      };

      var multitick = function multitick() {
        // multiple ticks in a row
        var ret = void 0;

        for (var i = 0; i < ticksPerFrame && !ret; i++) {
          ret = ret || inftick(); // pick up true ret vals => sim done
        }

        return ret;
      };

      if (options.animate) {
        var frame = function frame() {
          if (multitick()) {
            return;
          }

          raf(frame);
        };

        raf(frame);
      } else {
        while (!inftick()) {
          // keep going...
        }
      }
    },

    on: nop, // dummy; not needed

    drag: nop // not needed for our case
  });
  layout.adaptor = adaptor;

  // if set no grabbing during layout
  var grabbableNodes = nodes.filter(':grabbable');
  if (options.ungrabifyWhileSimulating) {
    grabbableNodes.ungrabify();
  }

  var destroyHandler = void 0;
  cy.one('destroy', destroyHandler = function destroyHandler() {
    layout.stop();
  });

  // handle node dragging
  var grabHandler = void 0;
  nodes.on('grab free position', grabHandler = function grabHandler(e) {
    var node = this;
    var scrCola = node.scratch().cola;
    var pos = node.position();
    var nodeIsTarget = e.cyTarget === node || e.target === node;

    if (!nodeIsTarget) {
      return;
    }

    switch (e.type) {
      case 'grab':
        adaptor.dragstart(scrCola);
        break;
      case 'free':
        adaptor.dragend(scrCola);
        break;
      case 'position':
        // only update when different (i.e. manual .position() call or drag) so we don't loop needlessly
        if (scrCola.px !== pos.x - bb.x1 || scrCola.py !== pos.y - bb.y1) {
          scrCola.px = pos.x - bb.x1;
          scrCola.py = pos.y - bb.y1;
        }
        break;
    }
  });

  var lockHandler = void 0;
  nodes.on('lock unlock', lockHandler = function lockHandler() {
    var node = this;
    var scrCola = node.scratch().cola;

    scrCola.fixed = node.locked();

    if (node.locked()) {
      adaptor.dragstart(scrCola);
    } else {
      adaptor.dragend(scrCola);
    }
  });

  // add nodes to cola
  adaptor.nodes(nonparentNodes.map(function (node, i) {
    var padding = getOptVal(options.nodeSpacing, node);
    var pos = node.position();
    var dimensions = node.layoutDimensions(options);

    var struct = node.scratch().cola = {
      x: options.randomize || pos.x === undefined ? Math.round(Math.random() * bb.w) : pos.x,
      y: options.randomize || pos.y === undefined ? Math.round(Math.random() * bb.h) : pos.y,
      width: dimensions.w + 2 * padding,
      height: dimensions.h + 2 * padding,
      index: i,
      fixed: node.locked()
    };

    return struct;
  }));

  // the constraints to be added on nodes
  var constraints = [];

  if (options.alignment) {
    // then set alignment constraints

    var offsetsX = [];
    var offsetsY = [];

    nonparentNodes.forEach(function (node) {
      var align = getOptVal(options.alignment, node);
      var scrCola = node.scratch().cola;
      var index = scrCola.index;

      if (!align) {
        return;
      }

      if (align.x != null) {
        offsetsX.push({
          node: index,
          offset: align.x
        });
      }

      if (align.y != null) {
        offsetsY.push({
          node: index,
          offset: align.y
        });
      }
    });

    if (offsetsX.length > 0) {
      constraints.push({
        type: 'alignment',
        axis: 'x',
        offsets: offsetsX
      });
    }

    if (offsetsY.length > 0) {
      constraints.push({
        type: 'alignment',
        axis: 'y',
        offsets: offsetsY
      });
    }
  }

  // if gapInequalities variable is set add each inequality constraint to list of constraints
  if (options.gapInequalities) {
    options.gapInequalities.forEach(function (inequality) {

      // for the constraints to be passed to cola layout adaptor use indices of nodes,
      // not the nodes themselves
      var leftIndex = inequality.left.scratch().cola.index;
      var rightIndex = inequality.right.scratch().cola.index;

      constraints.push({
        axis: inequality.axis,
        left: leftIndex,
        right: rightIndex,
        gap: inequality.gap,
        equality: inequality.equality
      });
    });
  }

  // add constraints if any
  if (constraints.length > 0) {
    adaptor.constraints(constraints);
  }

  // add compound nodes to cola
  adaptor.groups(parentNodes.map(function (node, i) {
    // add basic group incl leaf nodes
    var optPadding = getOptVal(options.nodeSpacing, node);
    var getPadding = function getPadding(d) {
      return parseFloat(node.style('padding-' + d));
    };

    var pleft = getPadding('left') + optPadding;
    var pright = getPadding('right') + optPadding;
    var ptop = getPadding('top') + optPadding;
    var pbottom = getPadding('bottom') + optPadding;

    node.scratch().cola = {
      index: i,

      padding: Math.max(pleft, pright, ptop, pbottom),

      // leaves should only contain direct descendants (children),
      // not the leaves of nested compound nodes or any nodes that are compounds themselves
      leaves: node.children().intersection(nonparentNodes).map(function (child) {
        return child[0].scratch().cola.index;
      }),

      fixed: node.locked()
    };

    return node;
  }).map(function (node) {
    // add subgroups
    node.scratch().cola.groups = node.children().intersection(parentNodes).map(function (child) {
      return child.scratch().cola.index;
    });

    return node.scratch().cola;
  }));

  // get the edge length setting mechanism
  var length = void 0;
  var lengthFnName = void 0;
  if (options.edgeLength != null) {
    length = options.edgeLength;
    lengthFnName = 'linkDistance';
  } else if (options.edgeSymDiffLength != null) {
    length = options.edgeSymDiffLength;
    lengthFnName = 'symmetricDiffLinkLengths';
  } else if (options.edgeJaccardLength != null) {
    length = options.edgeJaccardLength;
    lengthFnName = 'jaccardLinkLengths';
  } else {
    length = 100;
    lengthFnName = 'linkDistance';
  }

  var lengthGetter = function lengthGetter(link) {
    return link.calcLength;
  };

  // add the edges to cola
  adaptor.links(edges.stdFilter(function (edge) {
    return nonparentNodes.contains(edge.source()) && nonparentNodes.contains(edge.target());
  }).map(function (edge) {
    var c = edge.scratch().cola = {
      source: edge.source()[0].scratch().cola.index,
      target: edge.target()[0].scratch().cola.index
    };

    if (length != null) {
      c.calcLength = getOptVal(length, edge);
    }

    return c;
  }));

  adaptor.size([bb.w, bb.h]);

  if (length != null) {
    adaptor[lengthFnName](lengthGetter);
  }

  // set the flow of cola
  if (options.flow) {
    var flow = void 0;
    var defAxis = 'y';
    var defMinSep = 50;

    if (isString(options.flow)) {
      flow = {
        axis: options.flow,
        minSeparation: defMinSep
      };
    } else if (isNumber(options.flow)) {
      flow = {
        axis: defAxis,
        minSeparation: options.flow
      };
    } else if (isObject(options.flow)) {
      flow = options.flow;

      flow.axis = flow.axis || defAxis;
      flow.minSeparation = flow.minSeparation != null ? flow.minSeparation : defMinSep;
    } else {
      // e.g. options.flow: true
      flow = {
        axis: defAxis,
        minSeparation: defMinSep
      };
    }

    adaptor.flowLayout(flow.axis, flow.minSeparation);
  }

  layout.trigger({ type: 'layoutstart', layout: layout });

  adaptor.avoidOverlaps(options.avoidOverlap).handleDisconnected(options.handleDisconnected).start(options.unconstrIter, options.userConstIter, options.allConstIter);

  if (!options.infinite) {
    setTimeout(function () {
      if (!layout.manuallyStopped) {
        adaptor.stop();
      }
    }, options.maxSimulationTime);
  }

  return this; // chaining
};

// called on continuous layouts to stop them before they finish
ColaLayout.prototype.stop = function () {
  if (this.adaptor) {
    this.manuallyStopped = true;
    this.adaptor.stop();
  }

  return this; // chaining
};

module.exports = ColaLayout;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// default layout options
var defaults = {
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  ready: function ready() {}, // on layoutready
  stop: function stop() {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  nodeSpacing: function nodeSpacing(node) {
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode
};

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'cola', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var raf = void 0;

if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== ( true ? "undefined" : _typeof(undefined))) {
  raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
} else {
  // if not available, all you get is immediate calls
  raf = function raf(cb) {
    cb();
  };
}

module.exports = raf;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })
/******/ ]);
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dragula = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var emitter = require('contra/emitter');
var crossvent = require('crossvent');
var classes = require('./classes');
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    canMove: canMove,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }
    // truthy check fixes #239, equality fixes #207
    if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
      return;
    }
    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e);
      var clientY = getCoord('clientY', e);
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function canMove (item) {
    return !!canStart(item);
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    var initial = isInitialPlacement(parent);
    if (initial === false && reverts) {
      if (_copy) {
        if (parent) {
          parent.removeChild(_copy);
        }
      } else {
        _source.insertBefore(item, _initialSibling);
      }
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      (reference === null && changed) ||
      reference !== item &&
      reference !== nextEl(item)
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
        if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (global.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (global.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
  if (e.buttons !== void 0) { return e.buttons; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof global[offsetProp] !== 'undefined') {
    return global[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  var p = point || {};
  var state = p.className;
  var el;
  p.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  p.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes":1,"contra/emitter":5,"crossvent":6}],3:[function(require,module,exports){
module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }

},{}],4:[function(require,module,exports){
'use strict';

var ticky = require('ticky');

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};

},{"ticky":9}],5:[function(require,module,exports){
'use strict';

var atoa = require('atoa');
var debounce = require('./debounce');

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};

},{"./debounce":4,"atoa":3}],6:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = global.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./eventmap":7,"custom-event":8}],7:[function(require,module,exports){
(function (global){
'use strict';

var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in global) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;
},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGFzc2VzLmpzIiwiZHJhZ3VsYS5qcyIsIm5vZGVfbW9kdWxlcy9hdG9hL2F0b2EuanMiLCJub2RlX21vZHVsZXMvY29udHJhL2RlYm91bmNlLmpzIiwibm9kZV9tb2R1bGVzL2NvbnRyYS9lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvY3Jvc3N2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvZXZlbnRtYXAuanMiLCJub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpY2t5L3RpY2t5LWJyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2htQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FjaGUgPSB7fTtcbnZhciBzdGFydCA9ICcoPzpefFxcXFxzKSc7XG52YXIgZW5kID0gJyg/OlxcXFxzfCQpJztcblxuZnVuY3Rpb24gbG9va3VwQ2xhc3MgKGNsYXNzTmFtZSkge1xuICB2YXIgY2FjaGVkID0gY2FjaGVbY2xhc3NOYW1lXTtcbiAgaWYgKGNhY2hlZCkge1xuICAgIGNhY2hlZC5sYXN0SW5kZXggPSAwO1xuICB9IGVsc2Uge1xuICAgIGNhY2hlW2NsYXNzTmFtZV0gPSBjYWNoZWQgPSBuZXcgUmVnRXhwKHN0YXJ0ICsgY2xhc3NOYW1lICsgZW5kLCAnZycpO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzIChlbCwgY2xhc3NOYW1lKSB7XG4gIHZhciBjdXJyZW50ID0gZWwuY2xhc3NOYW1lO1xuICBpZiAoIWN1cnJlbnQubGVuZ3RoKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICB9IGVsc2UgaWYgKCFsb29rdXBDbGFzcyhjbGFzc05hbWUpLnRlc3QoY3VycmVudCkpIHtcbiAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJtQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobG9va3VwQ2xhc3MoY2xhc3NOYW1lKSwgJyAnKS50cmltKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZENsYXNzLFxuICBybTogcm1DbGFzc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVtaXR0ZXIgPSByZXF1aXJlKCdjb250cmEvZW1pdHRlcicpO1xudmFyIGNyb3NzdmVudCA9IHJlcXVpcmUoJ2Nyb3NzdmVudCcpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMnKTtcbnZhciBkb2MgPSBkb2N1bWVudDtcbnZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG5mdW5jdGlvbiBkcmFndWxhIChpbml0aWFsQ29udGFpbmVycywgb3B0aW9ucykge1xuICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgaWYgKGxlbiA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGluaXRpYWxDb250YWluZXJzKSA9PT0gZmFsc2UpIHtcbiAgICBvcHRpb25zID0gaW5pdGlhbENvbnRhaW5lcnM7XG4gICAgaW5pdGlhbENvbnRhaW5lcnMgPSBbXTtcbiAgfVxuICB2YXIgX21pcnJvcjsgLy8gbWlycm9yIGltYWdlXG4gIHZhciBfc291cmNlOyAvLyBzb3VyY2UgY29udGFpbmVyXG4gIHZhciBfaXRlbTsgLy8gaXRlbSBiZWluZyBkcmFnZ2VkXG4gIHZhciBfb2Zmc2V0WDsgLy8gcmVmZXJlbmNlIHhcbiAgdmFyIF9vZmZzZXRZOyAvLyByZWZlcmVuY2UgeVxuICB2YXIgX21vdmVYOyAvLyByZWZlcmVuY2UgbW92ZSB4XG4gIHZhciBfbW92ZVk7IC8vIHJlZmVyZW5jZSBtb3ZlIHlcbiAgdmFyIF9pbml0aWFsU2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgd2hlbiBncmFiYmVkXG4gIHZhciBfY3VycmVudFNpYmxpbmc7IC8vIHJlZmVyZW5jZSBzaWJsaW5nIG5vd1xuICB2YXIgX2NvcHk7IC8vIGl0ZW0gdXNlZCBmb3IgY29weWluZ1xuICB2YXIgX3JlbmRlclRpbWVyOyAvLyB0aW1lciBmb3Igc2V0VGltZW91dCByZW5kZXJNaXJyb3JJbWFnZVxuICB2YXIgX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDsgLy8gbGFzdCBjb250YWluZXIgaXRlbSB3YXMgb3ZlclxuICB2YXIgX2dyYWJiZWQ7IC8vIGhvbGRzIG1vdXNlZG93biBjb250ZXh0IHVudGlsIGZpcnN0IG1vdXNlbW92ZVxuXG4gIHZhciBvID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKG8ubW92ZXMgPT09IHZvaWQgMCkgeyBvLm1vdmVzID0gYWx3YXlzOyB9XG4gIGlmIChvLmFjY2VwdHMgPT09IHZvaWQgMCkgeyBvLmFjY2VwdHMgPSBhbHdheXM7IH1cbiAgaWYgKG8uaW52YWxpZCA9PT0gdm9pZCAwKSB7IG8uaW52YWxpZCA9IGludmFsaWRUYXJnZXQ7IH1cbiAgaWYgKG8uY29udGFpbmVycyA9PT0gdm9pZCAwKSB7IG8uY29udGFpbmVycyA9IGluaXRpYWxDb250YWluZXJzIHx8IFtdOyB9XG4gIGlmIChvLmlzQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5pc0NvbnRhaW5lciA9IG5ldmVyOyB9XG4gIGlmIChvLmNvcHkgPT09IHZvaWQgMCkgeyBvLmNvcHkgPSBmYWxzZTsgfVxuICBpZiAoby5jb3B5U29ydFNvdXJjZSA9PT0gdm9pZCAwKSB7IG8uY29weVNvcnRTb3VyY2UgPSBmYWxzZTsgfVxuICBpZiAoby5yZXZlcnRPblNwaWxsID09PSB2b2lkIDApIHsgby5yZXZlcnRPblNwaWxsID0gZmFsc2U7IH1cbiAgaWYgKG8ucmVtb3ZlT25TcGlsbCA9PT0gdm9pZCAwKSB7IG8ucmVtb3ZlT25TcGlsbCA9IGZhbHNlOyB9XG4gIGlmIChvLmRpcmVjdGlvbiA9PT0gdm9pZCAwKSB7IG8uZGlyZWN0aW9uID0gJ3ZlcnRpY2FsJzsgfVxuICBpZiAoby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9IHRydWU7IH1cbiAgaWYgKG8ubWlycm9yQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5taXJyb3JDb250YWluZXIgPSBkb2MuYm9keTsgfVxuXG4gIHZhciBkcmFrZSA9IGVtaXR0ZXIoe1xuICAgIGNvbnRhaW5lcnM6IG8uY29udGFpbmVycyxcbiAgICBzdGFydDogbWFudWFsU3RhcnQsXG4gICAgZW5kOiBlbmQsXG4gICAgY2FuY2VsOiBjYW5jZWwsXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgZGVzdHJveTogZGVzdHJveSxcbiAgICBjYW5Nb3ZlOiBjYW5Nb3ZlLFxuICAgIGRyYWdnaW5nOiBmYWxzZVxuICB9KTtcblxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB0cnVlKSB7XG4gICAgZHJha2Uub24oJ292ZXInLCBzcGlsbE92ZXIpLm9uKCdvdXQnLCBzcGlsbE91dCk7XG4gIH1cblxuICBldmVudHMoKTtcblxuICByZXR1cm4gZHJha2U7XG5cbiAgZnVuY3Rpb24gaXNDb250YWluZXIgKGVsKSB7XG4gICAgcmV0dXJuIGRyYWtlLmNvbnRhaW5lcnMuaW5kZXhPZihlbCkgIT09IC0xIHx8IG8uaXNDb250YWluZXIoZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vkb3duJywgZ3JhYik7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZXVwJywgcmVsZWFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHVhbE1vdmVtZW50cyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNlbW92ZScsIHN0YXJ0QmVjYXVzZU1vdXNlTW92ZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZW1lbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnc2VsZWN0c3RhcnQnLCBwcmV2ZW50R3JhYmJlZCk7IC8vIElFOFxuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnY2xpY2snLCBwcmV2ZW50R3JhYmJlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgICBldmVudHModHJ1ZSk7XG4gICAgcmVsZWFzZSh7fSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcmV2ZW50R3JhYmJlZCAoZSkge1xuICAgIGlmIChfZ3JhYmJlZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYWIgKGUpIHtcbiAgICBfbW92ZVggPSBlLmNsaWVudFg7XG4gICAgX21vdmVZID0gZS5jbGllbnRZO1xuXG4gICAgdmFyIGlnbm9yZSA9IHdoaWNoTW91c2VCdXR0b24oZSkgIT09IDEgfHwgZS5tZXRhS2V5IHx8IGUuY3RybEtleTtcbiAgICBpZiAoaWdub3JlKSB7XG4gICAgICByZXR1cm47IC8vIHdlIG9ubHkgY2FyZSBhYm91dCBob25lc3QtdG8tZ29kIGxlZnQgY2xpY2tzIGFuZCB0b3VjaCBldmVudHNcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBlLnRhcmdldDtcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfZ3JhYmJlZCA9IGNvbnRleHQ7XG4gICAgZXZlbnR1YWxNb3ZlbWVudHMoKTtcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgaWYgKGlzSW5wdXQoaXRlbSkpIHsgLy8gc2VlIGFsc286IGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8yMDhcbiAgICAgICAgaXRlbS5mb2N1cygpOyAvLyBmaXhlcyBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMTc2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8xNTVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydEJlY2F1c2VNb3VzZU1vdmVkIChlKSB7XG4gICAgaWYgKCFfZ3JhYmJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAod2hpY2hNb3VzZUJ1dHRvbihlKSA9PT0gMCkge1xuICAgICAgcmVsZWFzZSh7fSk7XG4gICAgICByZXR1cm47IC8vIHdoZW4gdGV4dCBpcyBzZWxlY3RlZCBvbiBhbiBpbnB1dCBhbmQgdGhlbiBkcmFnZ2VkLCBtb3VzZXVwIGRvZXNuJ3QgZmlyZS4gdGhpcyBpcyBvdXIgb25seSBob3BlXG4gICAgfVxuICAgIC8vIHRydXRoeSBjaGVjayBmaXhlcyAjMjM5LCBlcXVhbGl0eSBmaXhlcyAjMjA3XG4gICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwICYmIGUuY2xpZW50WCA9PT0gX21vdmVYICYmIGUuY2xpZW50WSAhPT0gdm9pZCAwICYmIGUuY2xpZW50WSA9PT0gX21vdmVZKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbikge1xuICAgICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuICAgICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBkb2MuZWxlbWVudEZyb21Qb2ludChjbGllbnRYLCBjbGllbnRZKTtcbiAgICAgIGlmIChpc0lucHV0KGVsZW1lbnRCZWhpbmRDdXJzb3IpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZ3JhYmJlZCA9IF9ncmFiYmVkOyAvLyBjYWxsIHRvIGVuZCgpIHVuc2V0cyBfZ3JhYmJlZFxuICAgIGV2ZW50dWFsTW92ZW1lbnRzKHRydWUpO1xuICAgIG1vdmVtZW50cygpO1xuICAgIGVuZCgpO1xuICAgIHN0YXJ0KGdyYWJiZWQpO1xuXG4gICAgdmFyIG9mZnNldCA9IGdldE9mZnNldChfaXRlbSk7XG4gICAgX29mZnNldFggPSBnZXRDb29yZCgncGFnZVgnLCBlKSAtIG9mZnNldC5sZWZ0O1xuICAgIF9vZmZzZXRZID0gZ2V0Q29vcmQoJ3BhZ2VZJywgZSkgLSBvZmZzZXQudG9wO1xuXG4gICAgY2xhc3Nlcy5hZGQoX2NvcHkgfHwgX2l0ZW0sICdndS10cmFuc2l0Jyk7XG4gICAgcmVuZGVyTWlycm9ySW1hZ2UoKTtcbiAgICBkcmFnKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuU3RhcnQgKGl0ZW0pIHtcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcgJiYgX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNDb250YWluZXIoaXRlbSkpIHtcbiAgICAgIHJldHVybjsgLy8gZG9uJ3QgZHJhZyBjb250YWluZXIgaXRzZWxmXG4gICAgfVxuICAgIHZhciBoYW5kbGUgPSBpdGVtO1xuICAgIHdoaWxlIChnZXRQYXJlbnQoaXRlbSkgJiYgaXNDb250YWluZXIoZ2V0UGFyZW50KGl0ZW0pKSA9PT0gZmFsc2UpIHtcbiAgICAgIGlmIChvLmludmFsaWQoaXRlbSwgaGFuZGxlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpdGVtID0gZ2V0UGFyZW50KGl0ZW0pOyAvLyBkcmFnIHRhcmdldCBzaG91bGQgYmUgYSB0b3AgZWxlbWVudFxuICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNvdXJjZSA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW92YWJsZSA9IG8ubW92ZXMoaXRlbSwgc291cmNlLCBoYW5kbGUsIG5leHRFbChpdGVtKSk7XG4gICAgaWYgKCFtb3ZhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjYW5Nb3ZlIChpdGVtKSB7XG4gICAgcmV0dXJuICEhY2FuU3RhcnQoaXRlbSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYW51YWxTdGFydCAoaXRlbSkge1xuICAgIHZhciBjb250ZXh0ID0gY2FuU3RhcnQoaXRlbSk7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHN0YXJ0KGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0IChjb250ZXh0KSB7XG4gICAgaWYgKGlzQ29weShjb250ZXh0Lml0ZW0sIGNvbnRleHQuc291cmNlKSkge1xuICAgICAgX2NvcHkgPSBjb250ZXh0Lml0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX2NvcHksIGNvbnRleHQuaXRlbSwgJ2NvcHknKTtcbiAgICB9XG5cbiAgICBfc291cmNlID0gY29udGV4dC5zb3VyY2U7XG4gICAgX2l0ZW0gPSBjb250ZXh0Lml0ZW07XG4gICAgX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gbmV4dEVsKGNvbnRleHQuaXRlbSk7XG5cbiAgICBkcmFrZS5kcmFnZ2luZyA9IHRydWU7XG4gICAgZHJha2UuZW1pdCgnZHJhZycsIF9pdGVtLCBfc291cmNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZCAoKSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIGRyb3AoaXRlbSwgZ2V0UGFyZW50KGl0ZW0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZ3JhYiAoKSB7XG4gICAgX2dyYWJiZWQgPSBmYWxzZTtcbiAgICBldmVudHVhbE1vdmVtZW50cyh0cnVlKTtcbiAgICBtb3ZlbWVudHModHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWxlYXNlIChlKSB7XG4gICAgdW5ncmFiKCk7XG5cbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIGlmIChkcm9wVGFyZ2V0ICYmICgoX2NvcHkgJiYgby5jb3B5U29ydFNvdXJjZSkgfHwgKCFfY29weSB8fCBkcm9wVGFyZ2V0ICE9PSBfc291cmNlKSkpIHtcbiAgICAgIGRyb3AoaXRlbSwgZHJvcFRhcmdldCk7XG4gICAgfSBlbHNlIGlmIChvLnJlbW92ZU9uU3BpbGwpIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcm9wIChpdGVtLCB0YXJnZXQpIHtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlICYmIHRhcmdldCA9PT0gX3NvdXJjZSkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKF9pdGVtKTtcbiAgICB9XG4gICAgaWYgKGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQpKSB7XG4gICAgICBkcmFrZS5lbWl0KCdjYW5jZWwnLCBpdGVtLCBfc291cmNlLCBfc291cmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHRhcmdldCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcbiAgICB9XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlICgpIHtcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIGRyYWtlLmVtaXQoX2NvcHkgPyAnY2FuY2VsJyA6ICdyZW1vdmUnLCBpdGVtLCBwYXJlbnQsIF9zb3VyY2UpO1xuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCAocmV2ZXJ0KSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmV2ZXJ0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwID8gcmV2ZXJ0IDogby5yZXZlcnRPblNwaWxsO1xuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudChwYXJlbnQpO1xuICAgIGlmIChpbml0aWFsID09PSBmYWxzZSAmJiByZXZlcnRzKSB7XG4gICAgICBpZiAoX2NvcHkpIHtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChfY29weSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9zb3VyY2UuaW5zZXJ0QmVmb3JlKGl0ZW0sIF9pbml0aWFsU2libGluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpbml0aWFsIHx8IHJldmVydHMpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmFrZS5lbWl0KCdkcm9wJywgaXRlbSwgcGFyZW50LCBfc291cmNlLCBfY3VycmVudFNpYmxpbmcpO1xuICAgIH1cbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbnVwICgpIHtcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHVuZ3JhYigpO1xuICAgIHJlbW92ZU1pcnJvckltYWdlKCk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGNsYXNzZXMucm0oaXRlbSwgJ2d1LXRyYW5zaXQnKTtcbiAgICB9XG4gICAgaWYgKF9yZW5kZXJUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KF9yZW5kZXJUaW1lcik7XG4gICAgfVxuICAgIGRyYWtlLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgaWYgKF9sYXN0RHJvcFRhcmdldCkge1xuICAgICAgZHJha2UuZW1pdCgnb3V0JywgaXRlbSwgX2xhc3REcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZHJha2UuZW1pdCgnZHJhZ2VuZCcsIGl0ZW0pO1xuICAgIF9zb3VyY2UgPSBfaXRlbSA9IF9jb3B5ID0gX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gX3JlbmRlclRpbWVyID0gX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5pdGlhbFBsYWNlbWVudCAodGFyZ2V0LCBzKSB7XG4gICAgdmFyIHNpYmxpbmc7XG4gICAgaWYgKHMgIT09IHZvaWQgMCkge1xuICAgICAgc2libGluZyA9IHM7XG4gICAgfSBlbHNlIGlmIChfbWlycm9yKSB7XG4gICAgICBzaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaWJsaW5nID0gbmV4dEVsKF9jb3B5IHx8IF9pdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldCA9PT0gX3NvdXJjZSAmJiBzaWJsaW5nID09PSBfaW5pdGlhbFNpYmxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kRHJvcFRhcmdldCAoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSkge1xuICAgIHZhciB0YXJnZXQgPSBlbGVtZW50QmVoaW5kQ3Vyc29yO1xuICAgIHdoaWxlICh0YXJnZXQgJiYgIWFjY2VwdGVkKCkpIHtcbiAgICAgIHRhcmdldCA9IGdldFBhcmVudCh0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gYWNjZXB0ZWQgKCkge1xuICAgICAgdmFyIGRyb3BwYWJsZSA9IGlzQ29udGFpbmVyKHRhcmdldCk7XG4gICAgICBpZiAoZHJvcHBhYmxlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbW1lZGlhdGUgPSBnZXRJbW1lZGlhdGVDaGlsZCh0YXJnZXQsIGVsZW1lbnRCZWhpbmRDdXJzb3IpO1xuICAgICAgdmFyIHJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZSh0YXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQsIHJlZmVyZW5jZSk7XG4gICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gc2hvdWxkIGFsd2F5cyBiZSBhYmxlIHRvIGRyb3AgaXQgcmlnaHQgYmFjayB3aGVyZSBpdCB3YXNcbiAgICAgIH1cbiAgICAgIHJldHVybiBvLmFjY2VwdHMoX2l0ZW0sIHRhcmdldCwgX3NvdXJjZSwgcmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcmFnIChlKSB7XG4gICAgaWYgKCFfbWlycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKTtcbiAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSk7XG4gICAgdmFyIHggPSBjbGllbnRYIC0gX29mZnNldFg7XG4gICAgdmFyIHkgPSBjbGllbnRZIC0gX29mZnNldFk7XG5cbiAgICBfbWlycm9yLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICBfbWlycm9yLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBjaGFuZ2VkID0gZHJvcFRhcmdldCAhPT0gbnVsbCAmJiBkcm9wVGFyZ2V0ICE9PSBfbGFzdERyb3BUYXJnZXQ7XG4gICAgaWYgKGNoYW5nZWQgfHwgZHJvcFRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgb3V0KCk7XG4gICAgICBfbGFzdERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgb3ZlcigpO1xuICAgIH1cbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChkcm9wVGFyZ2V0ID09PSBfc291cmNlICYmIF9jb3B5ICYmICFvLmNvcHlTb3J0U291cmNlKSB7XG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlZmVyZW5jZTtcbiAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQoZHJvcFRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG4gICAgaWYgKGltbWVkaWF0ZSAhPT0gbnVsbCkge1xuICAgICAgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKGRyb3BUYXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgfSBlbHNlIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHRydWUgJiYgIV9jb3B5KSB7XG4gICAgICByZWZlcmVuY2UgPSBfaW5pdGlhbFNpYmxpbmc7XG4gICAgICBkcm9wVGFyZ2V0ID0gX3NvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9jb3B5ICYmIHBhcmVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIChyZWZlcmVuY2UgPT09IG51bGwgJiYgY2hhbmdlZCkgfHxcbiAgICAgIHJlZmVyZW5jZSAhPT0gaXRlbSAmJlxuICAgICAgcmVmZXJlbmNlICE9PSBuZXh0RWwoaXRlbSlcbiAgICApIHtcbiAgICAgIF9jdXJyZW50U2libGluZyA9IHJlZmVyZW5jZTtcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gICAgICBkcmFrZS5lbWl0KCdzaGFkb3cnLCBpdGVtLCBkcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbW92ZWQgKHR5cGUpIHsgZHJha2UuZW1pdCh0eXBlLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpOyB9XG4gICAgZnVuY3Rpb24gb3ZlciAoKSB7IGlmIChjaGFuZ2VkKSB7IG1vdmVkKCdvdmVyJyk7IH0gfVxuICAgIGZ1bmN0aW9uIG91dCAoKSB7IGlmIChfbGFzdERyb3BUYXJnZXQpIHsgbW92ZWQoJ291dCcpOyB9IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNwaWxsT3ZlciAoZWwpIHtcbiAgICBjbGFzc2VzLnJtKGVsLCAnZ3UtaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3BpbGxPdXQgKGVsKSB7XG4gICAgaWYgKGRyYWtlLmRyYWdnaW5nKSB7IGNsYXNzZXMuYWRkKGVsLCAnZ3UtaGlkZScpOyB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJNaXJyb3JJbWFnZSAoKSB7XG4gICAgaWYgKF9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlY3QgPSBfaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBfbWlycm9yID0gX2l0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIF9taXJyb3Iuc3R5bGUud2lkdGggPSBnZXRSZWN0V2lkdGgocmVjdCkgKyAncHgnO1xuICAgIF9taXJyb3Iuc3R5bGUuaGVpZ2h0ID0gZ2V0UmVjdEhlaWdodChyZWN0KSArICdweCc7XG4gICAgY2xhc3Nlcy5ybShfbWlycm9yLCAnZ3UtdHJhbnNpdCcpO1xuICAgIGNsYXNzZXMuYWRkKF9taXJyb3IsICdndS1taXJyb3InKTtcbiAgICBvLm1pcnJvckNvbnRhaW5lci5hcHBlbmRDaGlsZChfbWlycm9yKTtcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAnYWRkJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgIGNsYXNzZXMuYWRkKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XG4gICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX21pcnJvciwgX2l0ZW0sICdtaXJyb3InKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU1pcnJvckltYWdlICgpIHtcbiAgICBpZiAoX21pcnJvcikge1xuICAgICAgY2xhc3Nlcy5ybShvLm1pcnJvckNvbnRhaW5lciwgJ2d1LXVuc2VsZWN0YWJsZScpO1xuICAgICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgJ3JlbW92ZScsICdtb3VzZW1vdmUnLCBkcmFnKTtcbiAgICAgIGdldFBhcmVudChfbWlycm9yKS5yZW1vdmVDaGlsZChfbWlycm9yKTtcbiAgICAgIF9taXJyb3IgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltbWVkaWF0ZUNoaWxkIChkcm9wVGFyZ2V0LCB0YXJnZXQpIHtcbiAgICB2YXIgaW1tZWRpYXRlID0gdGFyZ2V0O1xuICAgIHdoaWxlIChpbW1lZGlhdGUgIT09IGRyb3BUYXJnZXQgJiYgZ2V0UGFyZW50KGltbWVkaWF0ZSkgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgIGltbWVkaWF0ZSA9IGdldFBhcmVudChpbW1lZGlhdGUpO1xuICAgIH1cbiAgICBpZiAoaW1tZWRpYXRlID09PSBkb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gaW1tZWRpYXRlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlIChkcm9wVGFyZ2V0LCB0YXJnZXQsIHgsIHkpIHtcbiAgICB2YXIgaG9yaXpvbnRhbCA9IG8uZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgdmFyIHJlZmVyZW5jZSA9IHRhcmdldCAhPT0gZHJvcFRhcmdldCA/IGluc2lkZSgpIDogb3V0c2lkZSgpO1xuICAgIHJldHVybiByZWZlcmVuY2U7XG5cbiAgICBmdW5jdGlvbiBvdXRzaWRlICgpIHsgLy8gc2xvd2VyLCBidXQgYWJsZSB0byBmaWd1cmUgb3V0IGFueSBwb3NpdGlvblxuICAgICAgdmFyIGxlbiA9IGRyb3BUYXJnZXQuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgZWw7XG4gICAgICB2YXIgcmVjdDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBlbCA9IGRyb3BUYXJnZXQuY2hpbGRyZW5baV07XG4gICAgICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGhvcml6b250YWwgJiYgKHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyKSA+IHgpIHsgcmV0dXJuIGVsOyB9XG4gICAgICAgIGlmICghaG9yaXpvbnRhbCAmJiAocmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDIpID4geSkgeyByZXR1cm4gZWw7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2lkZSAoKSB7IC8vIGZhc3RlciwgYnV0IG9ubHkgYXZhaWxhYmxlIGlmIGRyb3BwZWQgaW5zaWRlIGEgY2hpbGQgZWxlbWVudFxuICAgICAgdmFyIHJlY3QgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAoaG9yaXpvbnRhbCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh4ID4gcmVjdC5sZWZ0ICsgZ2V0UmVjdFdpZHRoKHJlY3QpIC8gMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh5ID4gcmVjdC50b3AgKyBnZXRSZWN0SGVpZ2h0KHJlY3QpIC8gMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZSAoYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBhZnRlciA/IG5leHRFbCh0YXJnZXQpIDogdGFyZ2V0O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ29weSAoaXRlbSwgY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvLmNvcHkgPT09ICdib29sZWFuJyA/IG8uY29weSA6IG8uY29weShpdGVtLCBjb250YWluZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvdWNoeSAoZWwsIG9wLCB0eXBlLCBmbikge1xuICB2YXIgdG91Y2ggPSB7XG4gICAgbW91c2V1cDogJ3RvdWNoZW5kJyxcbiAgICBtb3VzZWRvd246ICd0b3VjaHN0YXJ0JyxcbiAgICBtb3VzZW1vdmU6ICd0b3VjaG1vdmUnXG4gIH07XG4gIHZhciBwb2ludGVycyA9IHtcbiAgICBtb3VzZXVwOiAncG9pbnRlcnVwJyxcbiAgICBtb3VzZWRvd246ICdwb2ludGVyZG93bicsXG4gICAgbW91c2Vtb3ZlOiAncG9pbnRlcm1vdmUnXG4gIH07XG4gIHZhciBtaWNyb3NvZnQgPSB7XG4gICAgbW91c2V1cDogJ01TUG9pbnRlclVwJyxcbiAgICBtb3VzZWRvd246ICdNU1BvaW50ZXJEb3duJyxcbiAgICBtb3VzZW1vdmU6ICdNU1BvaW50ZXJNb3ZlJ1xuICB9O1xuICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCkge1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHBvaW50ZXJzW3R5cGVdLCBmbik7XG4gIH0gZWxzZSBpZiAoZ2xvYmFsLm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgbWljcm9zb2Z0W3R5cGVdLCBmbik7XG4gIH0gZWxzZSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgdG91Y2hbdHlwZV0sIGZuKTtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0eXBlLCBmbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2hpY2hNb3VzZUJ1dHRvbiAoZSkge1xuICBpZiAoZS50b3VjaGVzICE9PSB2b2lkIDApIHsgcmV0dXJuIGUudG91Y2hlcy5sZW5ndGg7IH1cbiAgaWYgKGUud2hpY2ggIT09IHZvaWQgMCAmJiBlLndoaWNoICE9PSAwKSB7IHJldHVybiBlLndoaWNoOyB9IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMjYxXG4gIGlmIChlLmJ1dHRvbnMgIT09IHZvaWQgMCkgeyByZXR1cm4gZS5idXR0b25zOyB9XG4gIHZhciBidXR0b24gPSBlLmJ1dHRvbjtcbiAgaWYgKGJ1dHRvbiAhPT0gdm9pZCAwKSB7IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzk5ZThmZjFiYWE3YWUzNDFlOTRiYjg5YzNlODQ1NzBjN2MzYWQ5ZWEvc3JjL2V2ZW50LmpzI0w1NzMtTDU3NVxuICAgIHJldHVybiBidXR0b24gJiAxID8gMSA6IGJ1dHRvbiAmIDIgPyAzIDogKGJ1dHRvbiAmIDQgPyAyIDogMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0IChlbCkge1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIGxlZnQ6IHJlY3QubGVmdCArIGdldFNjcm9sbCgnc2Nyb2xsTGVmdCcsICdwYWdlWE9mZnNldCcpLFxuICAgIHRvcDogcmVjdC50b3AgKyBnZXRTY3JvbGwoJ3Njcm9sbFRvcCcsICdwYWdlWU9mZnNldCcpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCAoc2Nyb2xsUHJvcCwgb2Zmc2V0UHJvcCkge1xuICBpZiAodHlwZW9mIGdsb2JhbFtvZmZzZXRQcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsW29mZnNldFByb3BdO1xuICB9XG4gIGlmIChkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50RWxlbWVudFtzY3JvbGxQcm9wXTtcbiAgfVxuICByZXR1cm4gZG9jLmJvZHlbc2Nyb2xsUHJvcF07XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRCZWhpbmRQb2ludCAocG9pbnQsIHgsIHkpIHtcbiAgdmFyIHAgPSBwb2ludCB8fCB7fTtcbiAgdmFyIHN0YXRlID0gcC5jbGFzc05hbWU7XG4gIHZhciBlbDtcbiAgcC5jbGFzc05hbWUgKz0gJyBndS1oaWRlJztcbiAgZWwgPSBkb2MuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgcC5jbGFzc05hbWUgPSBzdGF0ZTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBuZXZlciAoKSB7IHJldHVybiBmYWxzZTsgfVxuZnVuY3Rpb24gYWx3YXlzICgpIHsgcmV0dXJuIHRydWU7IH1cbmZ1bmN0aW9uIGdldFJlY3RXaWR0aCAocmVjdCkgeyByZXR1cm4gcmVjdC53aWR0aCB8fCAocmVjdC5yaWdodCAtIHJlY3QubGVmdCk7IH1cbmZ1bmN0aW9uIGdldFJlY3RIZWlnaHQgKHJlY3QpIHsgcmV0dXJuIHJlY3QuaGVpZ2h0IHx8IChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKTsgfVxuZnVuY3Rpb24gZ2V0UGFyZW50IChlbCkgeyByZXR1cm4gZWwucGFyZW50Tm9kZSA9PT0gZG9jID8gbnVsbCA6IGVsLnBhcmVudE5vZGU7IH1cbmZ1bmN0aW9uIGlzSW5wdXQgKGVsKSB7IHJldHVybiBlbC50YWdOYW1lID09PSAnSU5QVVQnIHx8IGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScgfHwgZWwudGFnTmFtZSA9PT0gJ1NFTEVDVCcgfHwgaXNFZGl0YWJsZShlbCk7IH1cbmZ1bmN0aW9uIGlzRWRpdGFibGUgKGVsKSB7XG4gIGlmICghZWwpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIG5vIHBhcmVudHMgd2VyZSBlZGl0YWJsZVxuICBpZiAoZWwuY29udGVudEVkaXRhYmxlID09PSAnZmFsc2UnKSB7IHJldHVybiBmYWxzZTsgfSAvLyBzdG9wIHRoZSBsb29rdXBcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9IC8vIGZvdW5kIGEgY29udGVudEVkaXRhYmxlIGVsZW1lbnQgaW4gdGhlIGNoYWluXG4gIHJldHVybiBpc0VkaXRhYmxlKGdldFBhcmVudChlbCkpOyAvLyBjb250ZW50RWRpdGFibGUgaXMgc2V0IHRvICdpbmhlcml0J1xufVxuXG5mdW5jdGlvbiBuZXh0RWwgKGVsKSB7XG4gIHJldHVybiBlbC5uZXh0RWxlbWVudFNpYmxpbmcgfHwgbWFudWFsbHkoKTtcbiAgZnVuY3Rpb24gbWFudWFsbHkgKCkge1xuICAgIHZhciBzaWJsaW5nID0gZWw7XG4gICAgZG8ge1xuICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XG4gICAgfSB3aGlsZSAoc2libGluZyAmJiBzaWJsaW5nLm5vZGVUeXBlICE9PSAxKTtcbiAgICByZXR1cm4gc2libGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFdmVudEhvc3QgKGUpIHtcbiAgLy8gb24gdG91Y2hlbmQgZXZlbnQsIHdlIGhhdmUgdG8gdXNlIGBlLmNoYW5nZWRUb3VjaGVzYFxuICAvLyBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MTkyNTYzL3RvdWNoZW5kLWV2ZW50LXByb3BlcnRpZXNcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8zNFxuICBpZiAoZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdO1xuICB9XG4gIGlmIChlLmNoYW5nZWRUb3VjaGVzICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF07XG4gIH1cbiAgcmV0dXJuIGU7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkIChjb29yZCwgZSkge1xuICB2YXIgaG9zdCA9IGdldEV2ZW50SG9zdChlKTtcbiAgdmFyIG1pc3NNYXAgPSB7XG4gICAgcGFnZVg6ICdjbGllbnRYJywgLy8gSUU4XG4gICAgcGFnZVk6ICdjbGllbnRZJyAvLyBJRThcbiAgfTtcbiAgaWYgKGNvb3JkIGluIG1pc3NNYXAgJiYgIShjb29yZCBpbiBob3N0KSAmJiBtaXNzTWFwW2Nvb3JkXSBpbiBob3N0KSB7XG4gICAgY29vcmQgPSBtaXNzTWFwW2Nvb3JkXTtcbiAgfVxuICByZXR1cm4gaG9zdFtjb29yZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZHJhZ3VsYTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXRvYSAoYSwgbikgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSwgbik7IH1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRpY2t5ID0gcmVxdWlyZSgndGlja3knKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZSAoZm4sIGFyZ3MsIGN0eCkge1xuICBpZiAoIWZuKSB7IHJldHVybjsgfVxuICB0aWNreShmdW5jdGlvbiBydW4gKCkge1xuICAgIGZuLmFwcGx5KGN0eCB8fCBudWxsLCBhcmdzIHx8IFtdKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXRvYSA9IHJlcXVpcmUoJ2F0b2EnKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbWl0dGVyICh0aGluZywgb3B0aW9ucykge1xuICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBldnQgPSB7fTtcbiAgaWYgKHRoaW5nID09PSB1bmRlZmluZWQpIHsgdGhpbmcgPSB7fTsgfVxuICB0aGluZy5vbiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGlmICghZXZ0W3R5cGVdKSB7XG4gICAgICBldnRbdHlwZV0gPSBbZm5dO1xuICAgIH0gZWxzZSB7XG4gICAgICBldnRbdHlwZV0ucHVzaChmbik7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGZuLl9vbmNlID0gdHJ1ZTsgLy8gdGhpbmcub2ZmKGZuKSBzdGlsbCB3b3JrcyFcbiAgICB0aGluZy5vbih0eXBlLCBmbik7XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5vZmYgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKGMgPT09IDEpIHtcbiAgICAgIGRlbGV0ZSBldnRbdHlwZV07XG4gICAgfSBlbHNlIGlmIChjID09PSAwKSB7XG4gICAgICBldnQgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV0ID0gZXZ0W3R5cGVdO1xuICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cbiAgICAgIGV0LnNwbGljZShldC5pbmRleE9mKGZuKSwgMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcuZW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpbmcuZW1pdHRlclNuYXBzaG90KGFyZ3Muc2hpZnQoKSkuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG4gIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGV0ID0gKGV2dFt0eXBlXSB8fCBbXSkuc2xpY2UoMCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgICAgdmFyIGN0eCA9IHRoaXMgfHwgdGhpbmc7XG4gICAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJyAmJiBvcHRzLnRocm93cyAhPT0gZmFsc2UgJiYgIWV0Lmxlbmd0aCkgeyB0aHJvdyBhcmdzLmxlbmd0aCA9PT0gMSA/IGFyZ3NbMF0gOiBhcmdzOyB9XG4gICAgICBldC5mb3JFYWNoKGZ1bmN0aW9uIGVtaXR0ZXIgKGxpc3Rlbikge1xuICAgICAgICBpZiAob3B0cy5hc3luYykgeyBkZWJvdW5jZShsaXN0ZW4sIGFyZ3MsIGN0eCk7IH0gZWxzZSB7IGxpc3Rlbi5hcHBseShjdHgsIGFyZ3MpOyB9XG4gICAgICAgIGlmIChsaXN0ZW4uX29uY2UpIHsgdGhpbmcub2ZmKHR5cGUsIGxpc3Rlbik7IH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaW5nO1xuICAgIH07XG4gIH07XG4gIHJldHVybiB0aGluZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjdXN0b21FdmVudCA9IHJlcXVpcmUoJ2N1c3RvbS1ldmVudCcpO1xudmFyIGV2ZW50bWFwID0gcmVxdWlyZSgnLi9ldmVudG1hcCcpO1xudmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbnZhciBhZGRFdmVudCA9IGFkZEV2ZW50RWFzeTtcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcbnZhciBoYXJkQ2FjaGUgPSBbXTtcblxuaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICBhZGRFdmVudCA9IGFkZEV2ZW50SGFyZDtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZEV2ZW50LFxuICByZW1vdmU6IHJlbW92ZUV2ZW50LFxuICBmYWJyaWNhdGU6IGZhYnJpY2F0ZUV2ZW50XG59O1xuXG5mdW5jdGlvbiBhZGRFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZWwuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIHdyYXAoZWwsIHR5cGUsIGZuKSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBsaXN0ZW5lciA9IHVud3JhcChlbCwgdHlwZSwgZm4pO1xuICBpZiAobGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZWwuZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmYWJyaWNhdGVFdmVudCAoZWwsIHR5cGUsIG1vZGVsKSB7XG4gIHZhciBlID0gZXZlbnRtYXAuaW5kZXhPZih0eXBlKSA9PT0gLTEgPyBtYWtlQ3VzdG9tRXZlbnQoKSA6IG1ha2VDbGFzc2ljRXZlbnQoKTtcbiAgaWYgKGVsLmRpc3BhdGNoRXZlbnQpIHtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9IGVsc2Uge1xuICAgIGVsLmZpcmVFdmVudCgnb24nICsgdHlwZSwgZSk7XG4gIH1cbiAgZnVuY3Rpb24gbWFrZUNsYXNzaWNFdmVudCAoKSB7XG4gICAgdmFyIGU7XG4gICAgaWYgKGRvYy5jcmVhdGVFdmVudCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGUuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgfVxuICAgIHJldHVybiBlO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDdXN0b21FdmVudCAoKSB7XG4gICAgcmV0dXJuIG5ldyBjdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogbW9kZWwgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcHBlckZhY3RvcnkgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlciAob3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gb3JpZ2luYWxFdmVudCB8fCBnbG9iYWwuZXZlbnQ7XG4gICAgZS50YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCA9IGUucHJldmVudERlZmF1bHQgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZS53aGljaCA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGZuLmNhbGwoZWwsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIHdyYXBwZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKSB8fCB3cmFwcGVyRmFjdG9yeShlbCwgdHlwZSwgZm4pO1xuICBoYXJkQ2FjaGUucHVzaCh7XG4gICAgd3JhcHBlcjogd3JhcHBlcixcbiAgICBlbGVtZW50OiBlbCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGZuOiBmblxuICB9KTtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIHVud3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpID0gZmluZChlbCwgdHlwZSwgZm4pO1xuICBpZiAoaSkge1xuICAgIHZhciB3cmFwcGVyID0gaGFyZENhY2hlW2ldLndyYXBwZXI7XG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcbiAgICByZXR1cm4gd3JhcHBlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGksIGl0ZW07XG4gIGZvciAoaSA9IDA7IGkgPCBoYXJkQ2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICBpdGVtID0gaGFyZENhY2hlW2ldO1xuICAgIGlmIChpdGVtLmVsZW1lbnQgPT09IGVsICYmIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmZuID09PSBmbikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudG1hcCA9IFtdO1xudmFyIGV2ZW50bmFtZSA9ICcnO1xudmFyIHJvbiA9IC9eb24vO1xuXG5mb3IgKGV2ZW50bmFtZSBpbiBnbG9iYWwpIHtcbiAgaWYgKHJvbi50ZXN0KGV2ZW50bmFtZSkpIHtcbiAgICBldmVudG1hcC5wdXNoKGV2ZW50bmFtZS5zbGljZSgyKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBldmVudG1hcDtcbiIsIlxudmFyIE5hdGl2ZUN1c3RvbUV2ZW50ID0gZ2xvYmFsLkN1c3RvbUV2ZW50O1xuXG5mdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xuICB0cnkge1xuICAgIHZhciBwID0gbmV3IE5hdGl2ZUN1c3RvbUV2ZW50KCdjYXQnLCB7IGRldGFpbDogeyBmb286ICdiYXInIH0gfSk7XG4gICAgcmV0dXJuICAnY2F0JyA9PT0gcC50eXBlICYmICdiYXInID09PSBwLmRldGFpbC5mb287XG4gIH0gY2F0Y2ggKGUpIHtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ3Jvc3MtYnJvd3NlciBgQ3VzdG9tRXZlbnRgIGNvbnN0cnVjdG9yLlxuICpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC5DdXN0b21FdmVudFxuICpcbiAqIEBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVzZU5hdGl2ZSgpID8gTmF0aXZlQ3VzdG9tRXZlbnQgOlxuXG4vLyBJRSA+PSA5XG4nZnVuY3Rpb24nID09PSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPyBmdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICB9IGVsc2Uge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgdm9pZCAwKTtcbiAgfVxuICByZXR1cm4gZTtcbn0gOlxuXG4vLyBJRSA8PSA4XG5mdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgZS50eXBlID0gdHlwZTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xuICAgIGUuY2FuY2VsYWJsZSA9IEJvb2xlYW4ocGFyYW1zLmNhbmNlbGFibGUpO1xuICAgIGUuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgfSBlbHNlIHtcbiAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICBlLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICBlLmRldGFpbCA9IHZvaWQgMDtcbiAgfVxuICByZXR1cm4gZTtcbn1cbiIsInZhciBzaSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicsIHRpY2s7XG5pZiAoc2kpIHtcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRJbW1lZGlhdGUoZm4pOyB9O1xufSBlbHNlIHtcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRUaW1lb3V0KGZuLCAwKTsgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aWNrOyJdfQ==

;(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(window, document)
  } else {
    root.SimpleScrollbar = factory(window, document)
  }
})(this, function(w, d) {
  var raf = w.requestAnimationFrame || w.setImmediate || function(c) { return setTimeout(c, 0); };

  function initEl(el) {
    if (Object.prototype.hasOwnProperty.call(el, 'data-simple-scrollbar')) return;
    Object.defineProperty(el, 'data-simple-scrollbar', { value: new SimpleScrollbar(el) });
  }

  // Mouse drag handler
  function dragDealer(el, context) {
    var lastPageY;

    el.addEventListener('mousedown', function(e) {
      lastPageY = e.pageY;
      el.classList.add('ss-grabbed');
      d.body.classList.add('ss-grabbed');

      d.addEventListener('mousemove', drag);
      d.addEventListener('mouseup', stop);

      return false;
    });

    function drag(e) {
      var delta = e.pageY - lastPageY;
      lastPageY = e.pageY;

      raf(function() {
        context.el.scrollTop += delta / context.scrollRatio;
      });
    }

    function stop() {
      el.classList.remove('ss-grabbed');
      d.body.classList.remove('ss-grabbed');
      d.removeEventListener('mousemove', drag);
      d.removeEventListener('mouseup', stop);
    }
  }

  // Constructor
  function ss(el) {
    this.target = el;

    this.direction = w.getComputedStyle(this.target).direction;

    this.bar = '<div class="ss-scroll">';

    this.wrapper = d.createElement('div');
    this.wrapper.setAttribute('class', 'ss-wrapper');

    this.el = d.createElement('div');
    this.el.setAttribute('class', 'ss-content');

    if (this.direction === 'rtl') {
      this.el.classList.add('rtl');
    }

    this.wrapper.appendChild(this.el);

    while (this.target.firstChild) {
      this.el.appendChild(this.target.firstChild);
    }
    this.target.appendChild(this.wrapper);

    this.target.insertAdjacentHTML('beforeend', this.bar);
    this.bar = this.target.lastChild;

    dragDealer(this.bar, this);
    this.moveBar();

    w.addEventListener('resize', this.moveBar.bind(this));
    this.el.addEventListener('scroll', this.moveBar.bind(this));
    this.el.addEventListener('mouseenter', this.moveBar.bind(this));

    this.target.classList.add('ss-container');

    var css = w.getComputedStyle(el);
  	if (css['height'] === '0px' && css['max-height'] !== '0px') {
    	el.style.height = css['max-height'];
    }
  }

  ss.prototype = {
    moveBar: function(e) {
      var totalHeight = this.el.scrollHeight,
          ownHeight = this.el.clientHeight,
          _this = this;

      this.scrollRatio = ownHeight / totalHeight;

      var isRtl = _this.direction === 'rtl';
      var right = isRtl ?
        (_this.target.clientWidth - _this.bar.clientWidth + 18) :
        (_this.target.clientWidth - _this.bar.clientWidth) * -1;

      raf(function() {
        // Hide scrollbar if no scrolling is possible
        if(_this.scrollRatio >= 1) {
          _this.bar.classList.add('ss-hidden')
        } else {
          _this.bar.classList.remove('ss-hidden')
          _this.bar.style.cssText = 'height:' + Math.max(_this.scrollRatio * 100, 10) + '%; top:' + (_this.el.scrollTop / totalHeight ) * 100 + '%;right:' + right + 'px;';
        }
      });
    }
  }

  function initAll() {
    var nodes = d.querySelectorAll('*[ss-container]');

    for (var i = 0; i < nodes.length; i++) {
      initEl(nodes[i]);
    }
  }

  d.addEventListener('DOMContentLoaded', initAll);
  ss.initEl = initEl;
  ss.initAll = initAll;

  var SimpleScrollbar = ss;
  return SimpleScrollbar;
});

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeCxtmenu"] = factory();
	else
		root["cytoscapeCxtmenu"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(2);
var assign = __webpack_require__(1);

var _require = __webpack_require__(3),
    removeEles = _require.removeEles,
    setStyles = _require.setStyles,
    createElement = _require.createElement,
    getPixelRatio = _require.getPixelRatio,
    getOffset = _require.getOffset;

var cxtmenu = function cxtmenu(params) {
  var options = assign({}, defaults, params);
  var cy = this;
  var container = cy.container();
  var target = void 0;

  var data = {
    options: options,
    handlers: [],
    container: createElement({ class: 'cxtmenu' })
  };

  var wrapper = data.container;
  var parent = createElement();
  var canvas = createElement({ tag: 'canvas' });
  var commands = [];
  var c2d = canvas.getContext('2d');
  var r = options.menuRadius;
  var containerSize = (r + options.activePadding) * 2;
  var activeCommandI = void 0;
  var offset = void 0;

  container.insertBefore(wrapper, container.firstChild);
  wrapper.appendChild(parent);
  parent.appendChild(canvas);

  setStyles(wrapper, {
    position: 'absolute',
    zIndex: options.zIndex,
    userSelect: 'none'
  });

  setStyles(parent, {
    display: 'none',
    width: containerSize + 'px',
    height: containerSize + 'px',
    position: 'absolute',
    zIndex: 1,
    marginLeft: -options.activePadding + 'px',
    marginTop: -options.activePadding + 'px',
    userSelect: 'none'
  });

  canvas.width = containerSize;
  canvas.height = containerSize;

  function createMenuItems() {
    removeEles('.cxtmenu-item', parent);
    var dtheta = 2 * Math.PI / commands.length;
    var theta1 = Math.PI / 2;
    var theta2 = theta1 + dtheta;

    for (var i = 0; i < commands.length; i++) {
      var command = commands[i];

      var midtheta = (theta1 + theta2) / 2;
      var rx1 = 0.66 * r * Math.cos(midtheta);
      var ry1 = 0.66 * r * Math.sin(midtheta);

      var item = createElement({ class: 'cxtmenu-item' });
      setStyles(item, {
        color: options.itemColor,
        cursor: 'default',
        display: 'table',
        'text-align': 'center',
        //background: 'red',
        position: 'absolute',
        'text-shadow': '-1px -1px 2px ' + options.itemTextShadowColor + ', 1px -1px 2px ' + options.itemTextShadowColor + ', -1px 1px 2px ' + options.itemTextShadowColor + ', 1px 1px 1px ' + options.itemTextShadowColor,
        left: '50%',
        top: '50%',
        'min-height': r * 0.66 + 'px',
        width: r * 0.66 + 'px',
        height: r * 0.66 + 'px',
        marginLeft: rx1 - r * 0.33 + 'px',
        marginTop: -ry1 - r * 0.33 + 'px'
      });

      var content = createElement({ class: 'cxtmenu-content' });

      if (command.content instanceof HTMLElement) {
        content.appendChild(command.content);
      } else {
        content.innerHTML = command.content;
      }

      setStyles(content, {
        'width': r * 0.66 + 'px',
        'height': r * 0.66 + 'px',
        'vertical-align': 'middle',
        'display': 'table-cell'
      });

      setStyles(content, command.contentStyle || {});

      if (command.disabled === true || command.enabled === false) {
        content.classList.add('cxtmenu-disabled');
      }

      parent.appendChild(item);
      item.appendChild(content);

      theta1 += dtheta;
      theta2 += dtheta;
    }
  }

  function queueDrawBg(rspotlight) {
    redrawQueue.drawBg = [rspotlight];
  }

  function drawBg(rspotlight) {
    rspotlight = rspotlight !== undefined ? rspotlight : rs;

    c2d.globalCompositeOperation = 'source-over';

    c2d.clearRect(0, 0, containerSize, containerSize);

    // draw background items
    c2d.fillStyle = options.fillColor;
    var dtheta = 2 * Math.PI / commands.length;
    var theta1 = Math.PI / 2;
    var theta2 = theta1 + dtheta;

    for (var index = 0; index < commands.length; index++) {
      var command = commands[index];

      if (command.fillColor) {
        c2d.fillStyle = command.fillColor;
      }
      c2d.beginPath();
      c2d.moveTo(r + options.activePadding, r + options.activePadding);
      c2d.arc(r + options.activePadding, r + options.activePadding, r, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true);
      c2d.closePath();
      c2d.fill();

      theta1 += dtheta;
      theta2 += dtheta;

      c2d.fillStyle = options.fillColor;
    }

    // draw separators between items
    c2d.globalCompositeOperation = 'destination-out';
    c2d.strokeStyle = 'white';
    c2d.lineWidth = options.separatorWidth;
    theta1 = Math.PI / 2;
    theta2 = theta1 + dtheta;

    for (var i = 0; i < commands.length; i++) {
      var rx1 = r * Math.cos(theta1);
      var ry1 = r * Math.sin(theta1);
      c2d.beginPath();
      c2d.moveTo(r + options.activePadding, r + options.activePadding);
      c2d.lineTo(r + options.activePadding + rx1, r + options.activePadding - ry1);
      c2d.closePath();
      c2d.stroke();

      theta1 += dtheta;
      theta2 += dtheta;
    }

    c2d.fillStyle = 'white';
    c2d.globalCompositeOperation = 'destination-out';
    c2d.beginPath();
    c2d.arc(r + options.activePadding, r + options.activePadding, rspotlight + options.spotlightPadding, 0, Math.PI * 2, true);
    c2d.closePath();
    c2d.fill();

    c2d.globalCompositeOperation = 'source-over';
  }

  function queueDrawCommands(rx, ry, theta) {
    redrawQueue.drawCommands = [rx, ry, theta];
  }

  function drawCommands(rx, ry, theta) {
    var dtheta = 2 * Math.PI / commands.length;
    var theta1 = Math.PI / 2;
    var theta2 = theta1 + dtheta;

    theta1 += dtheta * activeCommandI;
    theta2 += dtheta * activeCommandI;

    c2d.fillStyle = options.activeFillColor;
    c2d.strokeStyle = 'black';
    c2d.lineWidth = 1;
    c2d.beginPath();
    c2d.moveTo(r + options.activePadding, r + options.activePadding);
    c2d.arc(r + options.activePadding, r + options.activePadding, r + options.activePadding, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true);
    c2d.closePath();
    c2d.fill();

    c2d.fillStyle = 'white';
    c2d.globalCompositeOperation = 'destination-out';

    var tx = r + options.activePadding + rx / r * (rs + options.spotlightPadding - options.indicatorSize / 4);
    var ty = r + options.activePadding + ry / r * (rs + options.spotlightPadding - options.indicatorSize / 4);
    var rot = Math.PI / 4 - theta;

    c2d.translate(tx, ty);
    c2d.rotate(rot);

    // clear the indicator
    c2d.beginPath();
    c2d.fillRect(-options.indicatorSize / 2, -options.indicatorSize / 2, options.indicatorSize, options.indicatorSize);
    c2d.closePath();
    c2d.fill();

    c2d.rotate(-rot);
    c2d.translate(-tx, -ty);

    // c2d.setTransform( 1, 0, 0, 1, 0, 0 );

    // clear the spotlight
    c2d.beginPath();
    c2d.arc(r + options.activePadding, r + options.activePadding, rs + options.spotlightPadding, 0, Math.PI * 2, true);
    c2d.closePath();
    c2d.fill();

    c2d.globalCompositeOperation = 'source-over';
  }

  function updatePixelRatio() {
    var pxr = getPixelRatio();
    var w = container.clientWidth;
    var h = container.clientHeight;

    canvas.width = w * pxr;
    canvas.height = h * pxr;

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    c2d.setTransform(1, 0, 0, 1, 0, 0);
    c2d.scale(pxr, pxr);
  }

  var redrawing = true;
  var redrawQueue = {};
  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  var redraw = function redraw() {
    if (redrawQueue.drawBg) {
      drawBg.apply(null, redrawQueue.drawBg);
    }

    if (redrawQueue.drawCommands) {
      drawCommands.apply(null, redrawQueue.drawCommands);
    }

    redrawQueue = {};

    if (redrawing) {
      raf(redraw);
    }
  };

  // kick off
  updatePixelRatio();
  redraw();

  var ctrx = void 0,
      ctry = void 0,
      rs = void 0;

  var bindings = {
    on: function on(events, selector, fn) {

      var _fn = fn;
      if (selector === 'core') {
        _fn = function _fn(e) {
          if (e.cyTarget === cy || e.target === cy) {
            // only if event target is directly core
            return fn.apply(this, [e]);
          }
        };
      }

      data.handlers.push({
        events: events,
        selector: selector,
        fn: _fn
      });

      if (selector === 'core') {
        cy.on(events, _fn);
      } else {
        cy.on(events, selector, _fn);
      }

      return this;
    }
  };

  function addEventListeners() {
    var grabbable = void 0;
    var inGesture = false;
    var dragHandler = void 0;
    var zoomEnabled = void 0;
    var panEnabled = void 0;
    var boxEnabled = void 0;
    var gestureStartEvent = void 0;

    var restoreZoom = function restoreZoom() {
      if (zoomEnabled) {
        cy.userZoomingEnabled(true);
      }
    };

    var restoreGrab = function restoreGrab() {
      if (grabbable) {
        target.grabify();
      }
    };

    var restorePan = function restorePan() {
      if (panEnabled) {
        cy.userPanningEnabled(true);
      }
    };

    var restoreBoxSeln = function restoreBoxSeln() {
      if (boxEnabled) {
        cy.boxSelectionEnabled(true);
      }
    };

    var restoreGestures = function restoreGestures() {
      restoreGrab();
      restoreZoom();
      restorePan();
      restoreBoxSeln();
    };

    window.addEventListener('resize', updatePixelRatio);

    bindings.on('resize', function () {
      updatePixelRatio();
    }).on(options.openMenuEvents, options.selector, function (e) {
      target = this; // Remember which node the context menu is for
      var ele = this;
      var isCy = this === cy;

      if (inGesture) {
        parent.style.display = 'none';

        inGesture = false;

        restoreGestures();
      }

      if (typeof options.commands === 'function') {
        commands = options.commands(target);
      } else {
        commands = options.commands;
      }

      if (!commands || commands.length === 0) {
        return;
      }

      zoomEnabled = cy.userZoomingEnabled();
      cy.userZoomingEnabled(false);

      panEnabled = cy.userPanningEnabled();
      cy.userPanningEnabled(false);

      boxEnabled = cy.boxSelectionEnabled();
      cy.boxSelectionEnabled(false);

      grabbable = target.grabbable && target.grabbable();
      if (grabbable) {
        target.ungrabify();
      }

      var rp = void 0,
          rw = void 0,
          rh = void 0;
      if (!isCy && ele.isNode() && !ele.isParent() && !options.atMouse) {
        rp = ele.renderedPosition();
        rw = ele.renderedWidth();
        rh = ele.renderedHeight();
      } else {
        rp = e.renderedPosition || e.cyRenderedPosition;
        rw = 1;
        rh = 1;
      }

      offset = getOffset(container);

      ctrx = rp.x;
      ctry = rp.y;

      createMenuItems();

      setStyles(parent, {
        display: 'block',
        left: rp.x - r + 'px',
        top: rp.y - r + 'px'
      });

      rs = Math.max(rw, rh) / 2;
      rs = Math.max(rs, options.minSpotlightRadius);
      rs = Math.min(rs, options.maxSpotlightRadius);

      queueDrawBg();

      activeCommandI = undefined;

      inGesture = true;
      gestureStartEvent = e;
    }).on('cxtdrag tapdrag', options.selector, dragHandler = function dragHandler(e) {

      if (!inGesture) {
        return;
      }

      var origE = e.originalEvent;
      var isTouch = origE.touches && origE.touches.length > 0;

      var pageX = isTouch ? origE.touches[0].pageX : origE.pageX;
      var pageY = isTouch ? origE.touches[0].pageY : origE.pageY;

      activeCommandI = undefined;

      var dx = pageX - offset.left - ctrx;
      var dy = pageY - offset.top - ctry;

      if (dx === 0) {
        dx = 0.01;
      }

      var d = Math.sqrt(dx * dx + dy * dy);
      var cosTheta = (dy * dy - d * d - dx * dx) / (-2 * d * dx);
      var theta = Math.acos(cosTheta);

      if (d < rs + options.spotlightPadding) {
        queueDrawBg();
        return;
      }

      queueDrawBg();

      var rx = dx * r / d;
      var ry = dy * r / d;

      if (dy > 0) {
        theta = Math.PI + Math.abs(theta - Math.PI);
      }

      var dtheta = 2 * Math.PI / commands.length;
      var theta1 = Math.PI / 2;
      var theta2 = theta1 + dtheta;

      for (var i = 0; i < commands.length; i++) {
        var command = commands[i];

        var inThisCommand = theta1 <= theta && theta <= theta2 || theta1 <= theta + 2 * Math.PI && theta + 2 * Math.PI <= theta2;

        if (command.disabled === true || command.enabled === false) {
          inThisCommand = false;
        }

        if (inThisCommand) {
          activeCommandI = i;
          break;
        }

        theta1 += dtheta;
        theta2 += dtheta;
      }

      queueDrawCommands(rx, ry, theta);
    }).on('tapdrag', dragHandler).on('cxttapend tapend', function () {
      parent.style.display = 'none';

      if (activeCommandI !== undefined) {
        var select = commands[activeCommandI].select;

        if (select) {
          select.apply(target, [target, gestureStartEvent]);
          activeCommandI = undefined;
        }
      }

      inGesture = false;

      restoreGestures();
    });
  }

  function removeEventListeners() {
    var handlers = data.handlers;

    for (var i = 0; i < handlers.length; i++) {
      var h = handlers[i];

      if (h.selector === 'core') {
        cy.off(h.events, h.fn);
      } else {
        cy.off(h.events, h.selector, h.fn);
      }
    }

    window.removeEventListener('resize', updatePixelRatio);
  }

  function destroyInstance() {
    redrawing = false;

    removeEventListeners();

    wrapper.remove();
  }

  addEventListeners();

  return {
    destroy: function destroy() {
      destroyInstance();
    }
  };
};

module.exports = cxtmenu;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = {
  menuRadius: 100, // the radius of the circular menu in pixels
  selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
  commands: [// an array of commands to list in the menu or a function that returns the array
    /*
    { // example command
      fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
      content: 'a command name' // html/text content to be displayed in the menu
      contentStyle: {}, // css key:value pairs to set the command's css in js if you want
      select: function(ele){ // a function to execute when the command is selected
        console.log( ele.id() ) // `ele` holds the reference to the active element
      },
      enabled: true // whether the command is selectable
    }
    */
  ], // function( ele ){ return [ /*...*/ ] }, // example function for commands
  fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
  activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
  activePadding: 20, // additional size in pixels for the active command
  indicatorSize: 24, // the size in pixels of the pointer to the active command
  separatorWidth: 3, // the empty spacing in pixels between successive commands
  spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
  minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
  maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
  openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
  itemColor: 'white', // the colour of text in the command's content
  itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
  zIndex: 9999, // the z-index of the ui div
  atMouse: false // draw menu at mouse position
};

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var removeEles = function removeEles(query) {
  var ancestor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  ancestor.querySelectorAll(query).forEach(function (el) {
    return el.parentNode.removeChild(el);
  });
};

var setStyles = function setStyles(el, style) {
  var props = Object.keys(style);

  for (var i = 0, l = props.length; i < l; i++) {
    el.style[props[i]] = style[props[i]];
  }
};

var createElement = function createElement(options) {
  options = options || {};

  var el = document.createElement(options.tag || 'div');

  el.className = options.class || '';

  if (options.style) {
    setStyles(el, options.style);
  }

  return el;
};

var getPixelRatio = function getPixelRatio() {
  return window.devicePixelRatio || 1;
};

var getOffset = function getOffset(el) {
  var offset = el.getBoundingClientRect();

  return {
    left: offset.left + document.body.scrollLeft + parseFloat(getComputedStyle(document.body)['padding-left']) + parseFloat(getComputedStyle(document.body)['border-left-width']),
    top: offset.top + document.body.scrollTop + parseFloat(getComputedStyle(document.body)['padding-top']) + parseFloat(getComputedStyle(document.body)['border-top-width'])
  };
};

module.exports = { removeEles: removeEles, setStyles: setStyles, createElement: createElement, getPixelRatio: getPixelRatio, getOffset: getOffset };

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var cxtmenu = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('core', 'cxtmenu', cxtmenu); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ })
/******/ ]);
});
// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// 2016-07-07, Brian Grinstead, MIT License
!function(a){function b(a,d){if(a=a?a:"",d=d||{},a instanceof b)return a;if(!(this instanceof b))return new b(a,d);var e=c(a);this._originalInput=a,this._r=e.r,this._g=e.g,this._b=e.b,this._a=e.a,this._roundA=P(100*this._a)/100,this._format=d.format||e.format,this._gradientType=d.gradientType,this._r<1&&(this._r=P(this._r)),this._g<1&&(this._g=P(this._g)),this._b<1&&(this._b=P(this._b)),this._ok=e.ok,this._tc_id=O++}function c(a){var b={r:0,g:0,b:0},c=1,e=null,g=null,i=null,j=!1,k=!1;return"string"==typeof a&&(a=K(a)),"object"==typeof a&&(J(a.r)&&J(a.g)&&J(a.b)?(b=d(a.r,a.g,a.b),j=!0,k="%"===String(a.r).substr(-1)?"prgb":"rgb"):J(a.h)&&J(a.s)&&J(a.v)?(e=G(a.s),g=G(a.v),b=h(a.h,e,g),j=!0,k="hsv"):J(a.h)&&J(a.s)&&J(a.l)&&(e=G(a.s),i=G(a.l),b=f(a.h,e,i),j=!0,k="hsl"),a.hasOwnProperty("a")&&(c=a.a)),c=z(c),{ok:j,format:a.format||k,r:Q(255,R(b.r,0)),g:Q(255,R(b.g,0)),b:Q(255,R(b.b,0)),a:c}}function d(a,b,c){return{r:255*A(a,255),g:255*A(b,255),b:255*A(c,255)}}function e(a,b,c){a=A(a,255),b=A(b,255),c=A(c,255);var d,e,f=R(a,b,c),g=Q(a,b,c),h=(f+g)/2;if(f==g)d=e=0;else{var i=f-g;switch(e=h>.5?i/(2-f-g):i/(f+g),f){case a:d=(b-c)/i+(c>b?6:0);break;case b:d=(c-a)/i+2;break;case c:d=(a-b)/i+4}d/=6}return{h:d,s:e,l:h}}function f(a,b,c){function d(a,b,c){return 0>c&&(c+=1),c>1&&(c-=1),1/6>c?a+6*(b-a)*c:.5>c?b:2/3>c?a+6*(b-a)*(2/3-c):a}var e,f,g;if(a=A(a,360),b=A(b,100),c=A(c,100),0===b)e=f=g=c;else{var h=.5>c?c*(1+b):c+b-c*b,i=2*c-h;e=d(i,h,a+1/3),f=d(i,h,a),g=d(i,h,a-1/3)}return{r:255*e,g:255*f,b:255*g}}function g(a,b,c){a=A(a,255),b=A(b,255),c=A(c,255);var d,e,f=R(a,b,c),g=Q(a,b,c),h=f,i=f-g;if(e=0===f?0:i/f,f==g)d=0;else{switch(f){case a:d=(b-c)/i+(c>b?6:0);break;case b:d=(c-a)/i+2;break;case c:d=(a-b)/i+4}d/=6}return{h:d,s:e,v:h}}function h(b,c,d){b=6*A(b,360),c=A(c,100),d=A(d,100);var e=a.floor(b),f=b-e,g=d*(1-c),h=d*(1-f*c),i=d*(1-(1-f)*c),j=e%6,k=[d,h,g,g,i,d][j],l=[i,d,d,h,g,g][j],m=[g,g,i,d,d,h][j];return{r:255*k,g:255*l,b:255*m}}function i(a,b,c,d){var e=[F(P(a).toString(16)),F(P(b).toString(16)),F(P(c).toString(16))];return d&&e[0].charAt(0)==e[0].charAt(1)&&e[1].charAt(0)==e[1].charAt(1)&&e[2].charAt(0)==e[2].charAt(1)?e[0].charAt(0)+e[1].charAt(0)+e[2].charAt(0):e.join("")}function j(a,b,c,d,e){var f=[F(P(a).toString(16)),F(P(b).toString(16)),F(P(c).toString(16)),F(H(d))];return e&&f[0].charAt(0)==f[0].charAt(1)&&f[1].charAt(0)==f[1].charAt(1)&&f[2].charAt(0)==f[2].charAt(1)&&f[3].charAt(0)==f[3].charAt(1)?f[0].charAt(0)+f[1].charAt(0)+f[2].charAt(0)+f[3].charAt(0):f.join("")}function k(a,b,c,d){var e=[F(H(d)),F(P(a).toString(16)),F(P(b).toString(16)),F(P(c).toString(16))];return e.join("")}function l(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.s-=c/100,d.s=B(d.s),b(d)}function m(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.s+=c/100,d.s=B(d.s),b(d)}function n(a){return b(a).desaturate(100)}function o(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.l+=c/100,d.l=B(d.l),b(d)}function p(a,c){c=0===c?0:c||10;var d=b(a).toRgb();return d.r=R(0,Q(255,d.r-P(255*-(c/100)))),d.g=R(0,Q(255,d.g-P(255*-(c/100)))),d.b=R(0,Q(255,d.b-P(255*-(c/100)))),b(d)}function q(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.l-=c/100,d.l=B(d.l),b(d)}function r(a,c){var d=b(a).toHsl(),e=(d.h+c)%360;return d.h=0>e?360+e:e,b(d)}function s(a){var c=b(a).toHsl();return c.h=(c.h+180)%360,b(c)}function t(a){var c=b(a).toHsl(),d=c.h;return[b(a),b({h:(d+120)%360,s:c.s,l:c.l}),b({h:(d+240)%360,s:c.s,l:c.l})]}function u(a){var c=b(a).toHsl(),d=c.h;return[b(a),b({h:(d+90)%360,s:c.s,l:c.l}),b({h:(d+180)%360,s:c.s,l:c.l}),b({h:(d+270)%360,s:c.s,l:c.l})]}function v(a){var c=b(a).toHsl(),d=c.h;return[b(a),b({h:(d+72)%360,s:c.s,l:c.l}),b({h:(d+216)%360,s:c.s,l:c.l})]}function w(a,c,d){c=c||6,d=d||30;var e=b(a).toHsl(),f=360/d,g=[b(a)];for(e.h=(e.h-(f*c>>1)+720)%360;--c;)e.h=(e.h+f)%360,g.push(b(e));return g}function x(a,c){c=c||6;for(var d=b(a).toHsv(),e=d.h,f=d.s,g=d.v,h=[],i=1/c;c--;)h.push(b({h:e,s:f,v:g})),g=(g+i)%1;return h}function y(a){var b={};for(var c in a)a.hasOwnProperty(c)&&(b[a[c]]=c);return b}function z(a){return a=parseFloat(a),(isNaN(a)||0>a||a>1)&&(a=1),a}function A(b,c){D(b)&&(b="100%");var d=E(b);return b=Q(c,R(0,parseFloat(b))),d&&(b=parseInt(b*c,10)/100),a.abs(b-c)<1e-6?1:b%c/parseFloat(c)}function B(a){return Q(1,R(0,a))}function C(a){return parseInt(a,16)}function D(a){return"string"==typeof a&&-1!=a.indexOf(".")&&1===parseFloat(a)}function E(a){return"string"==typeof a&&-1!=a.indexOf("%")}function F(a){return 1==a.length?"0"+a:""+a}function G(a){return 1>=a&&(a=100*a+"%"),a}function H(b){return a.round(255*parseFloat(b)).toString(16)}function I(a){return C(a)/255}function J(a){return!!V.CSS_UNIT.exec(a)}function K(a){a=a.replace(M,"").replace(N,"").toLowerCase();var b=!1;if(T[a])a=T[a],b=!0;else if("transparent"==a)return{r:0,g:0,b:0,a:0,format:"name"};var c;return(c=V.rgb.exec(a))?{r:c[1],g:c[2],b:c[3]}:(c=V.rgba.exec(a))?{r:c[1],g:c[2],b:c[3],a:c[4]}:(c=V.hsl.exec(a))?{h:c[1],s:c[2],l:c[3]}:(c=V.hsla.exec(a))?{h:c[1],s:c[2],l:c[3],a:c[4]}:(c=V.hsv.exec(a))?{h:c[1],s:c[2],v:c[3]}:(c=V.hsva.exec(a))?{h:c[1],s:c[2],v:c[3],a:c[4]}:(c=V.hex8.exec(a))?{r:C(c[1]),g:C(c[2]),b:C(c[3]),a:I(c[4]),format:b?"name":"hex8"}:(c=V.hex6.exec(a))?{r:C(c[1]),g:C(c[2]),b:C(c[3]),format:b?"name":"hex"}:(c=V.hex4.exec(a))?{r:C(c[1]+""+c[1]),g:C(c[2]+""+c[2]),b:C(c[3]+""+c[3]),a:I(c[4]+""+c[4]),format:b?"name":"hex8"}:(c=V.hex3.exec(a))?{r:C(c[1]+""+c[1]),g:C(c[2]+""+c[2]),b:C(c[3]+""+c[3]),format:b?"name":"hex"}:!1}function L(a){var b,c;return a=a||{level:"AA",size:"small"},b=(a.level||"AA").toUpperCase(),c=(a.size||"small").toLowerCase(),"AA"!==b&&"AAA"!==b&&(b="AA"),"small"!==c&&"large"!==c&&(c="small"),{level:b,size:c}}var M=/^\s+/,N=/\s+$/,O=0,P=a.round,Q=a.min,R=a.max,S=a.random;b.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var a=this.toRgb();return(299*a.r+587*a.g+114*a.b)/1e3},getLuminance:function(){var b,c,d,e,f,g,h=this.toRgb();return b=h.r/255,c=h.g/255,d=h.b/255,e=.03928>=b?b/12.92:a.pow((b+.055)/1.055,2.4),f=.03928>=c?c/12.92:a.pow((c+.055)/1.055,2.4),g=.03928>=d?d/12.92:a.pow((d+.055)/1.055,2.4),.2126*e+.7152*f+.0722*g},setAlpha:function(a){return this._a=z(a),this._roundA=P(100*this._a)/100,this},toHsv:function(){var a=g(this._r,this._g,this._b);return{h:360*a.h,s:a.s,v:a.v,a:this._a}},toHsvString:function(){var a=g(this._r,this._g,this._b),b=P(360*a.h),c=P(100*a.s),d=P(100*a.v);return 1==this._a?"hsv("+b+", "+c+"%, "+d+"%)":"hsva("+b+", "+c+"%, "+d+"%, "+this._roundA+")"},toHsl:function(){var a=e(this._r,this._g,this._b);return{h:360*a.h,s:a.s,l:a.l,a:this._a}},toHslString:function(){var a=e(this._r,this._g,this._b),b=P(360*a.h),c=P(100*a.s),d=P(100*a.l);return 1==this._a?"hsl("+b+", "+c+"%, "+d+"%)":"hsla("+b+", "+c+"%, "+d+"%, "+this._roundA+")"},toHex:function(a){return i(this._r,this._g,this._b,a)},toHexString:function(a){return"#"+this.toHex(a)},toHex8:function(a){return j(this._r,this._g,this._b,this._a,a)},toHex8String:function(a){return"#"+this.toHex8(a)},toRgb:function(){return{r:P(this._r),g:P(this._g),b:P(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+P(this._r)+", "+P(this._g)+", "+P(this._b)+")":"rgba("+P(this._r)+", "+P(this._g)+", "+P(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:P(100*A(this._r,255))+"%",g:P(100*A(this._g,255))+"%",b:P(100*A(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+P(100*A(this._r,255))+"%, "+P(100*A(this._g,255))+"%, "+P(100*A(this._b,255))+"%)":"rgba("+P(100*A(this._r,255))+"%, "+P(100*A(this._g,255))+"%, "+P(100*A(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":this._a<1?!1:U[i(this._r,this._g,this._b,!0)]||!1},toFilter:function(a){var c="#"+k(this._r,this._g,this._b,this._a),d=c,e=this._gradientType?"GradientType = 1, ":"";if(a){var f=b(a);d="#"+k(f._r,f._g,f._b,f._a)}return"progid:DXImageTransform.Microsoft.gradient("+e+"startColorstr="+c+",endColorstr="+d+")"},toString:function(a){var b=!!a;a=a||this._format;var c=!1,d=this._a<1&&this._a>=0,e=!b&&d&&("hex"===a||"hex6"===a||"hex3"===a||"hex4"===a||"hex8"===a||"name"===a);return e?"name"===a&&0===this._a?this.toName():this.toRgbString():("rgb"===a&&(c=this.toRgbString()),"prgb"===a&&(c=this.toPercentageRgbString()),("hex"===a||"hex6"===a)&&(c=this.toHexString()),"hex3"===a&&(c=this.toHexString(!0)),"hex4"===a&&(c=this.toHex8String(!0)),"hex8"===a&&(c=this.toHex8String()),"name"===a&&(c=this.toName()),"hsl"===a&&(c=this.toHslString()),"hsv"===a&&(c=this.toHsvString()),c||this.toHexString())},clone:function(){return b(this.toString())},_applyModification:function(a,b){var c=a.apply(null,[this].concat([].slice.call(b)));return this._r=c._r,this._g=c._g,this._b=c._b,this.setAlpha(c._a),this},lighten:function(){return this._applyModification(o,arguments)},brighten:function(){return this._applyModification(p,arguments)},darken:function(){return this._applyModification(q,arguments)},desaturate:function(){return this._applyModification(l,arguments)},saturate:function(){return this._applyModification(m,arguments)},greyscale:function(){return this._applyModification(n,arguments)},spin:function(){return this._applyModification(r,arguments)},_applyCombination:function(a,b){return a.apply(null,[this].concat([].slice.call(b)))},analogous:function(){return this._applyCombination(w,arguments)},complement:function(){return this._applyCombination(s,arguments)},monochromatic:function(){return this._applyCombination(x,arguments)},splitcomplement:function(){return this._applyCombination(v,arguments)},triad:function(){return this._applyCombination(t,arguments)},tetrad:function(){return this._applyCombination(u,arguments)}},b.fromRatio=function(a,c){if("object"==typeof a){var d={};for(var e in a)a.hasOwnProperty(e)&&(d[e]="a"===e?a[e]:G(a[e]));a=d}return b(a,c)},b.equals=function(a,c){return a&&c?b(a).toRgbString()==b(c).toRgbString():!1},b.random=function(){return b.fromRatio({r:S(),g:S(),b:S()})},b.mix=function(a,c,d){d=0===d?0:d||50;var e=b(a).toRgb(),f=b(c).toRgb(),g=d/100,h={r:(f.r-e.r)*g+e.r,g:(f.g-e.g)*g+e.g,b:(f.b-e.b)*g+e.b,a:(f.a-e.a)*g+e.a};return b(h)},b.readability=function(c,d){var e=b(c),f=b(d);return(a.max(e.getLuminance(),f.getLuminance())+.05)/(a.min(e.getLuminance(),f.getLuminance())+.05)},b.isReadable=function(a,c,d){var e,f,g=b.readability(a,c);switch(f=!1,e=L(d),e.level+e.size){case"AAsmall":case"AAAlarge":f=g>=4.5;break;case"AAlarge":f=g>=3;break;case"AAAsmall":f=g>=7}return f},b.mostReadable=function(a,c,d){var e,f,g,h,i=null,j=0;d=d||{},f=d.includeFallbackColors,g=d.level,h=d.size;for(var k=0;k<c.length;k++)e=b.readability(a,c[k]),e>j&&(j=e,i=b(c[k]));return b.isReadable(a,i,{level:g,size:h})||!f?i:(d.includeFallbackColors=!1,b.mostReadable(a,["#fff","#000"],d))};var T=b.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},U=b.hexNames=y(T),V=function(){var a="[-\\+]?\\d+%?",b="[-\\+]?\\d*\\.\\d+%?",c="(?:"+b+")|(?:"+a+")",d="[\\s|\\(]+("+c+")[,|\\s]+("+c+")[,|\\s]+("+c+")\\s*\\)?",e="[\\s|\\(]+("+c+")[,|\\s]+("+c+")[,|\\s]+("+c+")[,|\\s]+("+c+")\\s*\\)?";return{CSS_UNIT:new RegExp(c),rgb:new RegExp("rgb"+d),rgba:new RegExp("rgba"+e),hsl:new RegExp("hsl"+d),hsla:new RegExp("hsla"+e),hsv:new RegExp("hsv"+d),hsva:new RegExp("hsva"+e),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();"undefined"!=typeof module&&module.exports?module.exports=b:"function"==typeof define&&define.amd?define(function(){return b}):window.tinycolor=b}(Math);