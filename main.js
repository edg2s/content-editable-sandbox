/* eslint-disable no-alert */

$( function () {

	var currentHtml, currentCss,
		hasLocalStorage = !!window.localStorage,
		currentHtmlKey = 'current-html',
		savedStatesKey = 'saved-states',
		currentCssKey = 'current-css',
		editCssKey = 'edit-css',
		outlineKey = 'show-outline';

	function store() {
		if ( hasLocalStorage ) {
			localStorage.setItem( currentHtmlKey, $( '.ce' ).html() );
			localStorage.setItem( currentCssKey, $( '.css' ).val() );
		}
	}

	function updateHtml( html ) {
		$( '.html' ).val( html );
		$( '.ce' ).html( html );
	}

	function updateCss( css ) {
		$( '.css' ).val( css );
		$( '.style' ).html( $( '.editCss' ).prop( 'checked' ) ? css : '' );
	}

	function setObject( key, value ) {
		return hasLocalStorage ? localStorage.setItem( key, JSON.stringify( value ) ) : null;
	}

	function getObject( key ) {
		return JSON.parse( localStorage.getItem( key ) || 'null' );
	}

	function loadSavedStates() {
		return getObject( savedStatesKey ) || {};
	}

	function listSavedStates() {
		var name, count, savedStates, $ul;

		if ( hasLocalStorage ) {
			count = 0;
			savedStates = loadSavedStates();
			$ul = $( '<ul>' );

			for ( name in savedStates ) {
				$ul.append(
					$( '<li>' ).append(
						'[',
						$( '<a>' )
							.attr( 'href', '#' )
							.text( 'x' )
							// eslint-disable-next-line no-use-before-define
							.click( onDeleteClick ),
						'] ',
						$( '<a>' )
							.attr( 'href', '#' )
							.text( name )
							// eslint-disable-next-line no-use-before-define
							.click( onLoadClick ),
						' ',
						$( '<code>' ).text( savedStates[ name ].html.substr( 0, 40 ) + '...' ),
						' ',
						savedStates[ name ].css ?
							$( '<code>' ).text( savedStates[ name ].css.substr( 0, 40 ) + '...' ) : ''
					).data( 'name', name )
				);
				count++;
			}
			if ( count ) {
				$( '.savedStates' ).html( $ul );
			} else {
				$( '.savedStates' ).html( '<em>No saved states</em>' );
			}
		}
	}

	function onLoadClick() {
		var name = $( this ).closest( 'li' ).data( 'name' ),
			savedStates = loadSavedStates();

		if ( savedStates[ name ] ) {
			updateHtml( savedStates[ name ].html );
			updateCss( savedStates[ name ].css );
		}
	}

	function onDeleteClick() {
		var name = $( this ).closest( 'li' ).data( 'name' ),
			savedStates = loadSavedStates();

		delete savedStates[ name ];
		setObject( savedStatesKey, savedStates );
		listSavedStates();
	}

	$( '.ce' ).on( 'input keyup', function () {
		$( '.html' ).val( $( '.ce' ).html() );
		store();
	} );

	$( '.html' ).on( 'input keyup', function () {
		$( '.ce' ).html( $( '.html' ).val() );
		store();
	} );

	$( '.css' ).keyup( function () {
		$( '.style' ).html( $( '.css' ).val() );
		store();
	} );

	$( '.outline' ).change( function () {
		var checked = $( this ).prop( 'checked' );
		$( '.ce' ).toggleClass( 'outlined', checked );
		setObject( outlineKey, checked );
	} );

	$( '.editCss' ).change( function () {
		var checked = $( this ).prop( 'checked' );
		$( '.boxes' ).toggleClass( 'showCss', checked );
		setObject( editCssKey, checked );
		updateCss( $( '.css' ).val() );
	} );

	if ( getObject( outlineKey ) !== null ) {
		$( '.outline' ).prop( 'checked', getObject( outlineKey ) ).trigger( 'change' );
	}

	if ( getObject( editCssKey ) !== null ) {
		$( '.editCss' ).prop( 'checked', getObject( editCssKey ) ).trigger( 'change' );
	}

	$( '.clear' ).click( function () {
		updateHtml( '' );
		updateCss( '' );
		store();
	} );

	$( '.save' ).click( function () {
		var savedStates = loadSavedStates(),
			name = prompt( 'Name this saved state' );

		if (
			name !== null &&
			( savedStates[ name ] === undefined || confirm( 'Overwrite existing state with this name?' ) )
		) {
			savedStates[ name ] = {
				html: $( '.ce' ).html(),
				css: $( '.css' ).val()
			};
			setObject( savedStatesKey, savedStates );
			listSavedStates();
		}
	} );

	$( '.export' ).click( function () {
		prompt( 'Copy the text below',
			JSON.stringify( {
				html: $( '.ce' ).html(),
				css: $( '.css' ).val()
			} )
		);
	} );

	$( '.import' ).click( function () {
		var data, json = prompt( 'Paste the text below' );
		if ( json === null ) {
			return;
		}
		try {
			data = JSON.parse( json );
		} catch ( e ) {
			alert( 'Invalid JSON' );
			return;
		}
		if ( data.html ) {
			updateHtml( data.html );
		}
		if ( data.css ) {
			updateCss( data.css );
		}
	} );

	if ( hasLocalStorage ) {
		currentHtml = localStorage.getItem( currentHtmlKey );
		if ( currentHtml !== null ) {
			updateHtml( currentHtml );
		}
		currentCss = localStorage.getItem( currentCssKey );
		if ( currentCss !== null ) {
			updateCss( currentCss );
		}
		listSavedStates();
	} else {
		$( '.save, .saved' ).hide();
	}

} );
