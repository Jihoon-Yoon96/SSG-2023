function showTabContent(tabIndex) {
  // Get all tab elements and content elements
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // Hide all tab contents
  tabContents.forEach(content => {
    content.style.display = 'none';
  });

  // Remove 'active' class from all tabs
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });

  // Show the selected tab content and mark it as active
  tabContents[tabIndex].style.display = 'block';
  tabs[tabIndex].classList.add('active');
}

const today = new Date();
const thisMonth = today.getMonth() + 1;
let currentMonth = thisMonth;
function validationBtnMonth(elm) {
  const btnPrev = document.querySelector('.btn-month.prev');
  const btnNext = document.querySelector('.btn-month.next');
  if(elm.classList.contains('prev')){
    if(currentMonth > thisMonth) {
      currentMonth--;
    } else {
      alert('이전버튼은 이번달까지만 조회됩니다.');
    }
  } else {
    if(currentMonth <= thisMonth) {
      currentMonth++;
    } else {
      alert('다음버튼은 다음달까지만 조회됩니다.');
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

const weatherStore = 'SC00009'
const weatherUrl = "weather.json";
window.onload = function() {
  fetch(weatherUrl)
    .then(res => res.json())
    .then((data) => {
      for(key in data){
        if(data[key].area == weatherStore){
          funcWeather(data[key].icon12, data[key].temp);
        }
      }
    })
}

function funcWeather(icon, temp){
  const imgTarget = document.querySelector('.weather img');
  const tempTaret = document.querySelector('.weatherDegree');
  imgTarget.setAttribute('src', 'img/icons/weather_'+icon+'.gif');
  tempTaret.innerHTML=temp+'°';
}

function funcOpenBottomsheet(targetId){
  const openTarget = document.getElementById(targetId);
  const dimWrap = document.querySelector('.dim-wrap');
  openTarget.classList.add('active');
  dimWrap.classList.add('active');
}

function funcCloseBottomsheet(targetId){
  const CloseTarget = document.getElementById(targetId);
  const dimWrap = document.querySelector('.dim-wrap');
  CloseTarget.classList.remove('active');
  setTimeout(function() {
    dimWrap.classList.remove('active');
  },200);
}
