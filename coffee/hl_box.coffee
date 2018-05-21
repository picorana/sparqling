class window.HlBox

	constructor: (node) -> 
		@node = node

	to_html: =>
		res = document.createElement('div')
		res.innerHTML = '?' + @node.id()
		res.className = 'highlighting_box'
		res.style.backgroundColor = @node.data('color')
		
		return res
