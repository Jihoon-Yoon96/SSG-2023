function showTabContent(tabIndex) {

  // Get all tab elements and content elements
  let tabs = document.querySelectorAll('.tab');
  let tabContents = document.querySelectorAll('.tab-content');

  // Hide all tab contents
  tabContents.forEach(content => {
    content.style.display = 'none';
  });

  // Remove 'active' class from all tabs
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });


  // 서비스 시설 tab, 엔터테인먼트&교육 tab
  if(typeof tabIndex === 'string'){ // 'service-tab', 'enter-tab', 'smile-tab'
    let etc = document.querySelector('#'+tabIndex)
    let etcContents = document.querySelector('#'+tabIndex+'-contents')

    etcContents.style.display = 'block';
    etc.classList.add('active');
  }
  // 그외 tab
  else{
    // Show the selected tab content and mark it as active
    tabContents[tabIndex-1].style.display = 'block';
    tabs[tabIndex-1].classList.add('active');
  }
}

const today2 = new Date();
const thisMonth = today2.getMonth() + 1;
let currentMonth = thisMonth;

function validationBtnMonth(elm) {
  const btnPrev = document.querySelector('.btn-month.prev');
  const btnNext = document.querySelector('.btn-month.next');
  if(elm.classList.contains('prev')){
    if(currentMonth > thisMonth) {
      currentMonth--;

      if(calMonth-1 === 0) {
        calMonth = 12
        calYear--
        calendar(calYear,calMonth);
      } else {
        calendar(calYear,--calMonth);
      }
      // else calMonth--;
      // moveCnt--
      // calendar(calYear,--calMonth);
      // getNextCloseDay();
    } else {
      // alert('이전버튼은 이번달까지만 조회됩니다.');
    }
  } else {
    if(currentMonth <= thisMonth) {
      currentMonth++;

      if (calMonth + 1 === 13) {
        calMonth = 1
        calYear++
        calendar(calYear,calMonth);
      } else {
        calendar(calYear,++calMonth);
      }
      // else calMonth++;

      // moveCnt++
      // calendar(calYear,calMonth);
      // $("#closeStr").html("");
    } else {
      // alert('다음버튼은 다음달까지만 조회됩니다.');
    }
  }

  if(currentMonth > thisMonth){
    btnPrev.classList.add('active');
    btnNext.classList.remove('active');
  } else {
    btnPrev.classList.remove('active');
    btnNext.classList.add('active');
  }
  console.log('현재 달력은 ', currentMonth , '월 입니다');
  document.getElementsByClassName('year-month')[0].innerHTML = `${calYear}년 ${calMonth}월`
}

// 주소복사
function copyAddress(elm){
  const copyText = elm.textContent;
  navigator.clipboard.writeText(copyText);
  alert(copyText+ '\n\n주소가 클립보드에 복사되었습니다.');
}

// 층별안내도에서 카테고리별로 바로가기
function goTabContent(goIndex) {
  const tabs = document.querySelectorAll('.go-tab');
  const tabContents = document.querySelectorAll('.go-tab-content');
  tabs.forEach(content => {
    content.classList.remove('active');
  });
  tabs[goIndex].classList.add('active');
  const defaultY = tabContents[0].offsetTop;
  const scrollY = tabContents[goIndex].offsetTop;
  console.log('defaultY', defaultY);
  console.log('scrollY', scrollY);
  window.scrollTo(0, scrollY - defaultY);
}

function floorSelect(elm) {
  const floor = document.querySelectorAll('.floor');
  floor.forEach(content => {
    content.classList.remove('active');
  });
  elm.classList.add('active');

}

// bottom sheet
function funcOpenBottomsheet(targetId){
  const hiddenTarget = document.querySelector('.index.screen');
  hiddenTarget.classList.add('openBottomSheet');
  const openTarget = document.getElementById(targetId);
  const dimWrap = document.querySelector('.dim-wrap');
  openTarget.classList.add('active');
  dimWrap.classList.add('active');
}

function funcCloseBottomsheet(targetId){
  const hiddenTarget = document.querySelector('.index.screen');
  const CloseTarget = document.getElementById(targetId);
  const dimWrap = document.querySelector('.dim-wrap');
  CloseTarget.classList.remove('active');
  setTimeout(function() {
    dimWrap.classList.remove('active');
    hiddenTarget.classList.remove('openBottomSheet');
  },200);
}