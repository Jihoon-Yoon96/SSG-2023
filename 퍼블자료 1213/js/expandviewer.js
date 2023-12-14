/*
 * 확대 뷰어 모듈 스크립트
 * 
 * @author King
 * @version 1.0 (2013. 5. 8) 최초생성
 * @depends jQuery 1.9.1, jQuery Transit 0.9.9, jQuery Hammer 1.0.5
 */
(function( window, undefined ) {
	"use strict";
	
	// ======================================== 
	// 모듈 내 상수
	// ========================================
	var	NAMESPACE = 'd_exview';
	
	
	
	// ======================================== 
	// 확대 뷰어 모듈 생성자
	// ========================================
	/**
	 * ExpandViewer Class
	 * @class
	 * @param {Element} container 컨테이너 [ 아이디 | 엘리먼트 | 셀렉터 ]
	 * @param {Number} [options.sizeRate=auto] 크기 비율 [ parent:부모비율 | auto:자동 | 숫자 ]
	 * @param {Number} [options.minScale=1] 최소 비율
	 * @param {Number} [options.maxScale=3] 최대 비율
	 * @param {Boolean} [options.circular=false] 인덱스 순환 여부
	 * @param {Number} [options.index=0] 시작 인덱스
	 * @param {Function] [options.onReady] 모듈 준비 이벤트 핸들러
	 * @param {Function] [options.onUpdate] 화면 갱신 이벤트 핸들러
	 * @param {Function} [options.onDrag] 드래그 이벤트 핸들러
	 * @param {Function} [options.onTransform] 트랜스폼 이벤트 핸들러
	 * @example
	 * 	<div id="container">
	 * 		<div class="d_exview_viewport">
	 * 			<div class="img"><img /></div>
	 * 			<div class="img"><img /></div>
	 * 		</div>
	 * 		<div class="d_exview_overlay">
	 * 			<button class="d_exview_zoom_in"></button>
	 * 			<button class="d_exview_zoom_out"></button>
	 * 		</div>
	 * 		<div class="d_exview_overlay">
	 * 			<button class="d_exview_page_prev"></button>
	 * 			<button class="d_exview_page_next"></button>
	 * 		</div>
	 * 	</div>
	 * 	<script type="text/javascript">
	 * 		new ExpandViewer( 'container', {
	 * 		});
	 * 	</script>
	 */
	function ExpandViewer( container, options ) {
		// 옵션 확장
		this.options = $.extend({
			sizeRate: 'auto',
			minScale: 1,
			maxScale: 3,
			circular: false,
			index: 0
		}, options);
		
		// 멤버 변수
		this.$this = $( this ); // 인스턴스
		this.$window = $( window ); // 윈도우
		this.$container = $( document.getElementById( container ) || container ); // 컨테이너
		
		this.$viewport = this.$container.find( '.' + NAMESPACE + '_viewport' ); // 뷰포트
		this.$overlay = this.$container.find( '.' + NAMESPACE + '_overlay' ); // 오버레이
		this.$zoomIn = this.$container.find( '.' + NAMESPACE + '_zoom_in' ); // 줌 인 버튼
		this.$zoomOut = this.$container.find( '.' + NAMESPACE + '_zoom_out' ); // 줌 아웃 버튼
		this.$pagePrev = this.$container.find( '.' + NAMESPACE + '_page_prev' ); // 이전 페이지 버튼
		this.$pageNext = this.$container.find( '.' + NAMESPACE + '_page_next' ); // 다음 페이지 버튼
		
		this.$items = this.$viewport.children(); // 아이템
		this.conW = this.$container.width(); // 컨텐츠 넓이
		this.conH = this.$container.height(); // 컨텐츠 높이
		this.index = undefined; // 아이템 인덱스
		
		// 컨테이너 터치(Hammer) 객체
		this.$container.hammer();
		
		// 아이템 터치(Hammer) 객체
		this.$items.hammer({
			drag_min_distance: 0,
        	prevent_default: true
		});
		
		// 실행
		this._run();
	};
	
	
	
	// ======================================== 
	// 확대 뷰어 모듈 프로토타입
	// ========================================
	ExpandViewer.prototype = {
		/**
		 * 실행
		 * @private
		 * @function
		 */
		_run: function() {
			var that = this,
				$img = this.$items.eq( this.options.index ).find( 'img:first' );
			
			this._unbindEvent();
			this._bindEvent();
			this._bindMultiTouchEvent();
			
			// 더미 이미지 로드 이벤트
			$img.clone().load(function() {
				that.selectItem( that.options.index );
				that._dispatchEvent( 'onReady' );
			});
		},
			
		/**
		 * 이벤트 등록
		 * @private
		 * @function
		 */
		_bindEvent: function() {
			var that = this;
			
			// 윈도우 리사이즈 이벤트
			this.$window.on( 'resize.' + NAMESPACE, function( ev ) {
				that.conW = that.$container.width();
				that.conH = that.$container.height();
				that._update();
			});
			
			// 뷰포트 탭 이벤트
			this.$viewport.on( 'tap.' + NAMESPACE, function( ev ) {
				that.toggleOverlay();
			});
			
			// 줌 인 버튼 클릭 이벤트
			this.$zoomIn.on( 'click.' + NAMESPACE, function( ev ) {
				ev.preventDefault();
				that.zoomIn();
			});
			
			// 줌 아웃 버튼 클릭 이벤트
			this.$zoomOut.on( 'click.' + NAMESPACE, function( ev ) {
				ev.preventDefault();
				that.zoomOut();
			});
			
			// 이전 버튼 클릭 이벤트
			this.$pagePrev.on( 'click.' + NAMESPACE, function( ev ) {
				ev.preventDefault();
				that.prevItem();
			});
			
			// 다음 버튼 클릭 이벤트
			this.$pageNext.on( 'click.' + NAMESPACE, function( ev ) {
				ev.preventDefault();
				that.nextItem();
			});
		},
		
		/**
		 * 멀티터치 이벤트 등록
		 * @private
		 * @function
		 */
		_bindMultiTouchEvent: function() {
			var that = this,
				evns = [ 'dragstart', 'drag', 'dragend', 'transformstart', 'transform', 'transformend', 'swipeleft', 'swiperight' ].join( '.' + NAMESPACE + ' ' ) + '.' + NAMESPACE,
				curS = 0,
				curX = 0,
				curY = 0,
				tchX = 0,
				tchY = 0;
			
			// 아이템 멀티터치 이벤트
			this.$items.on( evns, function( ev ) {
				if ( ! ev.gesture ) return;
				var $i = $( this );
				
				switch ( ev.type ) {
				case 'dragstart':
					curS = parseFloat( $i.data( 'scale' ), 10 ) || 1;
            		curX = parseFloat( $i.css( 'x' ), 10 ) || 0;
                    curY = parseFloat( $i.css( 'y' ), 10 ) || 0;
                    tchX = ev.gesture.touches[0].pageX;
                    tchY = ev.gesture.touches[0].pageY;
                    that._dispatchEvent( 'onDragStart' );
					break;
				case 'drag':
					that._update({
						x: curX + ( ev.gesture.touches[0].pageX - tchX ),
                        y: curY + ( ev.gesture.touches[0].pageY - tchY )
					});
					
					that._dispatchEvent( 'onDrag' );
					break;
				case 'dragend':
					that._dispatchEvent( 'onDragEnd' );
					break;
				case 'transformstart':
					curS = parseFloat( $i.data( 'scale' ), 10 ) || 1;
            		curX = parseFloat( $i.css( 'x' ), 10 ) || 0;
                    curY = parseFloat( $i.css( 'y' ), 10 ) || 0;
                    tchX = ev.gesture.touches[0].pageX;
                    tchY = ev.gesture.touches[0].pageY;
                    that._dispatchEvent( 'onTransformStart' );
					break;
				case 'transform':
					that._update({
                        scale: curS * ev.gesture.scale
                    });
					
					that._dispatchEvent( 'onTransform' );
					break;
				case 'transformend':
					that._dispatchEvent( 'onTransformEnd' );
					break;
				case 'swipeleft':
					if ( curS * ev.gesture.scale <= 1 ) {
						that.nextItem();
					}
					break;
				case 'swiperight':
					if ( curS * ev.gesture.scale <= 1 ) {
						that.prevItem();
					}
					break;
				}
			});
		},
		
		/**
		 * 이벤트 해제
		 * @private
		 * @function
		 */
		_unbindEvent: function() {
			this.$this.off( '.' + NAMESPACE );
			this.$window.off( '.' + NAMESPACE );
			this.$container.off( '.' + NAMESPACE );
			
			this.$viewport.off( '.' + NAMESPACE );
			this.$overlay.off( '.' + NAMESPACE );
			this.$zoomIn.off( '.' + NAMESPACE );
			this.$zoomOut.off( '.' + NAMESPACE );
			this.$pagePrev.off( '.' + NAMESPACE );
			this.$pageNext.off( '.' + NAMESPACE );
			
			this.$items.off( '.' + NAMESPACE );
		},
		
		/**
		 * 이벤트 발생
		 * @private
		 * @function
		 * @param {String} name 이벤트 이름
		 */
		_dispatchEvent: function( name ) {
			return $.isFunction( this.options[ name ] ) && this.options[ name ].call( this, this.getInfo() ); 
		},
		
		/**
		 * 화면 갱신
		 * @private
		 * @function
		 * @param {Number} [args.scale=1] 비율
		 * @param {Number} [args.x] X 좌표
		 * @param {Number} [args.y] Y 좌표
		 */
		_update: function( args ) {
            this._updateView( args );
            this._updateZoom();
            this._updatePage();
            this._dispatchEvent( 'onUpdate' );
		},
		
		/**
		 * 뷰포트 갱신
		 * @private
		 * @function
		 * @param {Number} [args.scale=1] 비율
		 * @param {Number} [args.x] X 좌표
		 * @param {Number} [args.y] Y 좌표
		 */
		_updateView: function( args ) {
			var opts = this.options,
				conW = this.conW,
				conH = this.conH,
				$i = this.$items.eq( this.index ),
				s = parseFloat( args && args.scale, 10 ) || parseFloat( $i.data( 'scale' ), 10 ) || 1,
				x = parseFloat( args && args.x, 10 ) || parseFloat( $i.css( 'x' ), 10 ) || 0,
				y = parseFloat( args && args.y, 10 ) || parseFloat( $i.css( 'y' ), 10 ) || 0,
				w = 0,
				h = 0;
			
			// 비율 조정
			s = Math.min( opts.maxScale, Math.max( opts.minScale, s ) );
			$i.data( 'scale', s );
			
			// 넓이 조정
			$i.width( conW * s );
			
			// 높이 조정
			if ( opts.sizeRate === 'parent' ) {
				$i.height( conW * s * ( conW / conH ) );
			} else if ( ! isNaN( opts.sizeRate ) ) {
				$i.height( conW * s * Number( opts.sizeRate ) );
			}
			
			// 위치 조정
			w = $i.width();
			h = $i.height();
			x = conW > w ? ( conW - w ) / 2 : Math.min( 0, Math.max( conW - w, x ) );
            y = conH > h ? ( conH - h ) / 2 : Math.min( 0, Math.max( conH - h, y ) );
            $i.css({ x: x, y: y });
		},
		
		/**
		 * 줌 버튼 갱신
		 * @private
		 * @function
		 */
		_updateZoom: function() {
			var $i = this.$items.eq( this.index ),
				s = parseFloat( $i.data( 'scale' ), 10 ) || 1;
			
			this.$zoomIn[ s < this.options.maxScale ? 'removeClass' : 'addClass' ]( 'disabled' );
			this.$zoomOut[ s > this.options.minScale ? 'removeClass' : 'addClass' ]( 'disabled' );
		},
		
		/**
		 * 페이지 버튼 갱신
		 * @private
		 * @function
		 */
		_updatePage: function() {
			var pp = this.$items.length > 1 && ( this.options.circular || this.index > 0 ),
				pn = this.$items.length > 1 && ( this.options.circular || this.index < this.$items.length - 1 );
			
			this.$pagePrev[ pp ? 'removeClass' : 'addClass' ]( 'disabled' );
			this.$pageNext[ pn ? 'removeClass' : 'addClass' ]( 'disabled' );
		},
		
		/**
		 * 아이템 선택
		 * @function
		 * @param {Number} index 인덱스
		 */
		selectItem: function( index ) {
			var len = this.$items.length;
			
			if ( this.options.circular ) {
				index = ( ( index % len ) + len ) % len;
			} else if ( index < 0 || index > len - 1 ) {
				return;
			}
			
			if ( index !== this.index ) {
				this.index = index;
				this.$items.eq( index ).show().siblings().hide();
				this._update({ scale: 1, x: 0, y: 0 });
				this._dispatchEvent( 'onSelectItem' );
			}
		},
		
		/**
		 * 이전 아이템 선택
		 * @function
		 */
		prevItem: function() {
			if ( this.index > 0 && this.index <= this.$items.length - 1 ) {
				this.selectItem( this.index - 1 );
			}
		},
		
		/**
		 * 다음 아이템 선택
		 * @function
		 */
		nextItem: function() {
			if ( this.index >= 0 && this.index < this.$items.length - 1 ) {
				this.selectItem( this.index + 1 );
			}
		},
		
		/**
		 * 줌 설정
		 * @function
		 * @param {Number} scale 줌 비율 [ min:최소 | max:최대 | 숫자 ]
		 */
		setZoom: function( scale ) {
			if ( scale === 'min' ) {
				scale = this.options.minScale;
			} else if ( scale === 'max' ) {
				scale = this.options.maxScale;
			}
			
			this._update({ scale: scale });
		},
		
		/**
		 * 줌 인
		 * @function
		 */
		zoomIn: function() {
			this._update({ scale: this.getInfo().scale + 1 });
			this._dispatchEvent( 'onTransform' );
		},
		
		/**
		 * 줌 아웃
		 * @function
		 */
		zoomOut: function() {
			this._update({ scale: this.getInfo().scale - 1 });
			this._dispatchEvent( 'onTransform' );
		},
		
		/**
		 * 오버레이 토글
		 * @function
		 */
		toggleOverlay: function() {
			if ( this.$overlay.is( ':hidden' ) ) {
				this.showOverlay();
			} else {
				this.hideOverlay();
			}
		},
		
		/**
		 * 오버레이 보임
		 * @function
		 */
		showOverlay: function() {
			this.$overlay.show();
		},
		
		/**
		 * 오버레이 숨김
		 * @function
		 */
		hideOverlay: function() {
			this.$overlay.hide();
		},
		
		/**
		 * 아이템의 하위 엘리먼트의 위치로 이동
		 * @function
		 * @param {Element} el 대상 엘리먼트
		 */
		moveToElement: function( el ) {
			var $i = this.$items.eq( this.index ),
				$e = $( el ),
				x, y;
			
			if ( $i.has( $e ) ) {
				x = $e.position().left - ( ( this.conW - $e.width() ) / 2 );
				y = $e.position().top - ( ( this.conH - $e.height() ) / 2 );
				
				this._update({ x: -x, y: -y });
			}
		},
		
		/**
		 * 정보 반환
		 * @function
		 * @returns {JSON} 정보 객체
		 */
		getInfo: function() {
			var $i = this.$items.eq( this.index );
			
			return {
				$items: this.$items,
				$item: $i,
				index: this.index,
				length: this.$items.length,
				scale: parseFloat( $i.data( 'scale' ), 10 ) || 1,
				x: parseFloat( $i.css( 'x' ), 10 ) || 0,
				y: parseFloat( $i.css( 'y' ), 10 ) || 0
			};
		}
	};
	
	
	
	// ======================================== 
	// 전역 변수에 등록
	// ========================================
	window.ExpandViewer = ExpandViewer;
	
})( window );