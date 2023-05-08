/* eslint-disable no-alert, no-jquery/no-global-selector */

$( function () {

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

	function store() {
		localStorage.setItem( currentHtmlKey, $ce.html() );
		localStorage.setItem( currentCssKey, $css.val() );
	}

	function updateHtml( html ) {
		$html.val(
			$formatHtml.prop( 'checked' ) ?
				html_beautify( html ) : html
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
		return localStorage.setItem( key, JSON.stringify( value ) );
	}

	function getObject( key ) {
		return JSON.parse( localStorage.getItem( key ) || 'null' );
	}

	function loadSavedStates() {
		return getObject( savedStatesKey ) || {};
	}

	function listSavedStates() {
		const $savedStates = $( '.savedStates' );

		let count = 0;
		const savedStates = loadSavedStates();
		const $ul = $( '<ul>' );

		for ( const name in savedStates ) {
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
					$( '<code>' ).text( savedStates[ name ].html.slice( 0, 40 ) + '...' ),
					' ',
					savedStates[ name ].css ?
						$( '<code>' ).text( savedStates[ name ].css.slice( 0, 40 ) + '...' ) : ''
				).data( 'name', name )
			);
			count++;
		}
		if ( count ) {
			$savedStates.html( $ul );
		} else {
			$savedStates.append( $( '<em>' ).text( 'No saved states' ) );
		}
	}

	function onLoadClick() {
		const name = $( this ).closest( 'li' ).data( 'name' ),
			savedStates = loadSavedStates();

		if ( savedStates[ name ] ) {
			updateHtml( savedStates[ name ].html );
			updateCe( savedStates[ name ].html );
			updateCss( savedStates[ name ].css );
		}
	}

	function onDeleteClick() {
		const name = $( this ).closest( 'li' ).data( 'name' ),
			savedStates = loadSavedStates();

		delete savedStates[ name ];
		setObject( savedStatesKey, savedStates );
		listSavedStates();
	}

	$ce.on( 'input keyup', function () {
		updateHtml( $ce.html() );
		store();
	} );

	$html.on( 'input keyup', function () {
		$ce.html( $html.val() );
		store();
	} );

	$css.on( 'keyup', function () {
		$style.html( $css.val() );
		store();
	} );

	function persistCheckbox( key, $checkbox ) {
		const val = getObject( key );
		$checkbox.on( 'change', function () {
			const checked = $checkbox.prop( 'checked' );
			setObject( key, checked );
		} );
		if ( val !== null ) {
			$checkbox.prop( 'checked', val ).trigger( 'change' );
		}
	}

	persistCheckbox( 'show-outline', $outline );
	persistCheckbox( 'edit-css', $editCss );
	persistCheckbox( 'format-html', $formatHtml );

	$outline.on( 'change', function () {
		$ce.toggleClass( 'outlined', $( this ).prop( 'checked' ) );
	} ).trigger( 'change' );

	$editCss.on( 'change', function () {
		$( '.boxes' ).toggleClass( 'showCss', $( this ).prop( 'checked' ) );
		updateCss( $css.val() );
	} ).trigger( 'change' );

	$formatHtml.on( 'change', function () {
		updateHtml( $ce.html() );
	} );

	$clear.on( 'click', function () {
		updateHtml( '' );
		updateCe( '' );
		updateCss( '' );
		store();
	} );

	$save.on( 'click', function () {
		const savedStates = loadSavedStates(),
			name = prompt( 'Name this saved state' );

		if (
			name !== null &&
			( savedStates[ name ] === undefined || confirm( 'Overwrite existing state with this name?' ) )
		) {
			savedStates[ name ] = {
				html: $ce.html(),
				css: $css.val()
			};
			setObject( savedStatesKey, savedStates );
			listSavedStates();
		}
	} );

	$export.on( 'click', function () {
		prompt( 'Copy the text below',
			JSON.stringify( {
				html: $ce.html(),
				css: $css.val()
			} )
		);
	} );

	$import.on( 'click', function () {
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
		if ( data.html ) {
			updateHtml( data.html );
			updateCe( data.html );
		}
		if ( data.css ) {
			updateCss( data.css );
		}
	} );

	const currentHtml = localStorage.getItem( currentHtmlKey );
	if ( currentHtml !== null ) {
		updateHtml( currentHtml );
		updateCe( currentHtml );
	}
	const currentCss = localStorage.getItem( currentCssKey );
	if ( currentCss !== null ) {
		updateCss( currentCss );
	}
	listSavedStates();

} );
