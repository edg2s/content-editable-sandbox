/* eslint-disable no-alert, no-jquery/no-global-selector */

$( () => {

	const savedStatesKey = 'saved-states',
		currentHtmlKey = 'current-html',
		currentCssKey = 'current-css',
		$ce = $( '.ce' ),
		$css = $( '.css' ),
		$html = $( '.html' ),
		$style = $( '.style' ),
		$outline = $( '.outline' ),
		$editCss = $( '.editCss' ),
		$formatHtml = $( '.formatHtml' ),
		$clear = $( '.clear' ),
		$save = $( '.save' ),
		$export = $( '.export' ),
		$import = $( '.import' );

	// localStorage can throw if storage is disabled or full
	function getItem( key ) {
		try {
			return localStorage.getItem( key );
		} catch ( e ) {
			return null;
		}
	}

	function setItem( key, value ) {
		try {
			localStorage.setItem( key, value );
		} catch ( e ) {
			// Storage unavailable, state won't be persisted
		}
	}

	function store() {
		setItem( currentHtmlKey, $ce.html() );
		setItem( currentCssKey, $css.val() );
	}

	function updateHtml( html ) {
		$html.val(
			$formatHtml.prop( 'checked' ) ?
				beautifier.html( html ) : html
		);
	}

	function updateCe( html ) {
		$ce.html( html );
	}

	function updateCss( css ) {
		$css.val( css );
		$style.html( $editCss.prop( 'checked' ) ? css : '' );
	}

	function setObject( key, value ) {
		setItem( key, JSON.stringify( value ) );
	}

	function getObject( key ) {
		try {
			return JSON.parse( getItem( key ) || 'null' );
		} catch ( e ) {
			return null;
		}
	}

	function loadSavedStates() {
		// Use a null-prototype object so names like "__proto__" or
		// "toString" are treated as ordinary keys
		return Object.assign( Object.create( null ), getObject( savedStatesKey ) );
	}

	function truncate( text ) {
		return text.length > 40 ? text.slice( 0, 40 ) + '...' : text;
	}

	function listSavedStates() {
		const $savedStates = $( '.savedStates' ).empty(),
			savedStates = loadSavedStates(),
			names = Object.keys( savedStates );

		if ( !names.length ) {
			$savedStates.append( $( '<em>' ).text( 'No saved states' ) );
			return;
		}

		const $ul = $( '<ul>' );
		names.forEach( ( name ) => {
			$ul.append(
				$( '<li>' ).append(
					'[',
					$( '<a>' )
						.attr( 'href', '#' )
						.text( 'x' )
						.on( 'click', onDeleteClick ),
					'] ',
					$( '<a>' )
						.attr( 'href', '#' )
						.text( name )
						.on( 'click', onLoadClick ),
					' ',
					$( '<code>' ).text( truncate( savedStates[ name ].html ) ),
					' ',
					savedStates[ name ].css ?
						$( '<code>' ).text( truncate( savedStates[ name ].css ) ) : ''
				).data( 'name', name )
			);
		} );
		$savedStates.append( $ul );
	}

	function onLoadClick( e ) {
		e.preventDefault();
		const name = $( e.target ).closest( 'li' ).data( 'name' ),
			savedStates = loadSavedStates();

		if ( savedStates[ name ] ) {
			updateHtml( savedStates[ name ].html );
			updateCe( savedStates[ name ].html );
			updateCss( savedStates[ name ].css || '' );
			store();
		}
	}

	function onDeleteClick( e ) {
		e.preventDefault();
		const name = $( e.target ).closest( 'li' ).data( 'name' ),
			savedStates = loadSavedStates();

		delete savedStates[ name ];
		setObject( savedStatesKey, savedStates );
		listSavedStates();
	}

	$ce.on( 'input', () => {
		updateHtml( $ce.html() );
		store();
	} );

	$html.on( 'input', () => {
		$ce.html( $html.val() );
		store();
	} );

	$css.on( 'input', () => {
		$style.html( $css.val() );
		store();
	} );

	$outline.on( 'change', ( e ) => {
		$ce.toggleClass( 'outlined', $( e.target ).prop( 'checked' ) );
	} );

	$editCss.on( 'change', ( e ) => {
		$( '.boxes' ).toggleClass( 'showCss', $( e.target ).prop( 'checked' ) );
		updateCss( $css.val() );
	} );

	$formatHtml.on( 'change', () => {
		updateHtml( $ce.html() );
	} );

	function persistCheckbox( key, $checkbox ) {
		const val = getObject( key );
		if ( val !== null ) {
			$checkbox.prop( 'checked', val );
		}
		// Apply the initial state before listening for changes to persist
		$checkbox.trigger( 'change' ).on( 'change', () => {
			setObject( key, $checkbox.prop( 'checked' ) );
		} );
	}

	persistCheckbox( 'show-outline', $outline );
	persistCheckbox( 'edit-css', $editCss );
	persistCheckbox( 'format-html', $formatHtml );

	$clear.on( 'click', () => {
		updateHtml( '' );
		updateCe( '' );
		updateCss( '' );
		store();
	} );

	$save.on( 'click', () => {
		const savedStates = loadSavedStates(),
			name = prompt( 'Name this saved state' );

		if ( !name ) {
			return;
		}
		if ( savedStates[ name ] === undefined || confirm( 'Overwrite existing state with this name?' ) ) {
			savedStates[ name ] = {
				html: $ce.html(),
				css: $css.val()
			};
			setObject( savedStatesKey, savedStates );
			listSavedStates();
		}
	} );

	$export.on( 'click', () => {
		prompt( 'Copy the text below',
			JSON.stringify( {
				html: $ce.html(),
				css: $css.val()
			} )
		);
	} );

	$import.on( 'click', () => {
		const json = prompt( 'Paste the text below' );
		if ( json === null ) {
			return;
		}
		let data;
		try {
			data = JSON.parse( json );
		} catch ( e ) {
			alert( 'Invalid JSON' );
			return;
		}
		if ( !data || typeof data !== 'object' ) {
			alert( 'Invalid data' );
			return;
		}
		if ( typeof data.html === 'string' ) {
			updateHtml( data.html );
			updateCe( data.html );
		}
		if ( typeof data.css === 'string' ) {
			updateCss( data.css );
		}
		store();
	} );

	const currentHtml = getItem( currentHtmlKey );
	if ( currentHtml !== null ) {
		updateHtml( currentHtml );
		updateCe( currentHtml );
	}
	const currentCss = getItem( currentCssKey );
	if ( currentCss !== null ) {
		updateCss( currentCss );
	}
	listSavedStates();

} );
