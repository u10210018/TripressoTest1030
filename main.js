const store = new Vuex.Store({
    state: {
        tourList: {},
        currentPage: 1,
        filterState: 'rating_desc',
        perPage: 5,
        totalPages: 1,
        isPriceFilterShow: false,
    },
    mutations: {
        getTourData(state, data) {
            state.tourList = data;
        },
        changePage(state, pageNo) {
            state.currentPage = pageNo;
        },
        changeFilter(state, filter) {
            state.filterState = filter;
        },
        setTotalPages(state, data) {
            state.totalPages = data / state.perPage;
        },
        setPriceFilterShow(state, bool) {
            state.isPriceFilterShow = bool;
        }
    },
    actions: {
        getTourData: ({
            commit,
            dispatch,
            state
        }) => {
            axios.get('http://interview.tripresso.com/tour/search', {
                    params: {
                        page: state.currentPage,
                        row_per_page: state.perPage,
                        sort: state.filterState
                    }
                })
                .then((res) => {
                    commit('getTourData', res.data.data.tour_list);
                    dispatch('getTotalPages');
                })
                .catch((error) => {
                    console.error(error);
                })
        },
        getTotalPages: ({
            commit,
            state
        }) => {
            axios.get('http://interview.tripresso.com/tour/search', {
                    params: {
                        page: 1,
                        row_per_page: 1000,
                        sort: state.filterState
                    }
                })
                .then((res) => {
                    commit('setTotalPages', res.data.data.tour_list.length);
                })
                .catch((error) => {
                    console.error(error);
                })
        },
        changePage({
            commit
        }, pageNo) {
            commit('changePage', pageNo);
        },
        changeFilter({
            commit,
            dispatch
        }, filter) {
            commit('changeFilter', filter);
            dispatch('getTourData');
        },
        setPriceFilterShow({
            commit
        }, bool) {
            commit('setPriceFilterShow', bool);
        },
    },
    getters: {
        tourList: (state) => {
            return state.tourList;
        },
        currentPage: (state) => {
            return state.currentPage;
        },
        getFilterState: (state) => {
            return state.filterState;
        },
        getTotalPages: (state) => {
            return state.totalPages;
        },
        getPriceFilterShow: (state) => {
            return state.isPriceFilterShow;
        },
        getPerPage: (state) => {
            return state.perPage;
        },

    },

});

const NavBar = {
    data() {
        return {
            priceTitle: '價格',
            isRatingDesc: true
        }
    },
    template: `<nav class="nav">
                    <ul>
                        <li>排序</li>
                        <li :class="{'state-on': filterState == 'rating_desc' || filterState == 'rating_asc'}"
                            @click="isRatingDesc ? changeFilter('rating_desc'): changeFilter('rating_asc'); isRatingDesc = !isRatingDesc">精選評分</li>
                        <li @click.self="changeIsPriceFilterShow" id="priceFilter"
                            :class="{'state-on': filterState == 'price_asc' || filterState == 'price_desc'}">{{priceTitle}}
                            <span class="arrow down"></span>
                            <ul class="price-filter" v-if="isPriceFilterShow">
                                <li @click="priceTitle = '價格 : 低至高'; changeFilter('price_asc');">價格 : 低至高</li>
                                <li @click="priceTitle = '價格 : 高至低'; changeFilter('price_desc');">價格 : 高至低</li>
                            </ul>
                        </li>
                        <li @click="changeFilter('day')"
                            :class="{'state-on': filterState == 'day'}"
                            >天數<span class="arrow down"></span></li>
                        <li @click="changeFilter('date')"
                            :class="{'state-on': filterState == 'date'}"
                        >出發日期</li>
                    </ul>
                </nav>`,
    methods: {
        changeFilter(filter) {
            if (this.filterState !== filter) this.$store.dispatch('changePage', 1);
            this.$store.dispatch('changeFilter', filter);
            this.$store.dispatch('setPriceFilterShow', false);
            if (filter !== 'price_asc' && filter !== 'price_desc') this.priceTitle = '價格';
            if (filter !== 'rating_asc' && filter !== 'rating_desc') this.isRatingDesc = true;
        },
        changeIsPriceFilterShow() {
            this.$store.dispatch('setPriceFilterShow', !this.isPriceFilterShow);
        },
    },
    computed: {
        filterState() {
            return this.$store.getters.getFilterState;
        },
        isPriceFilterShow() {
            return this.$store.getters.getPriceFilterShow;
        }
    },
};

const TourList = {
    template: `<ul class="item-list">
                    <li v-for="tour in tourList" :key="tour.id">
                        <div>
                            <div class="pic">
                                <img :src="tour.image_url"">
                            </div>
                            <div class="main-info">
                                <div class="tour-info">
                                    <span class="company">
                                        <a :href="tour.tour_detail_url">{{tour.agency}}
                                            <i class="fa fa-star checked" v-for="(v,i) in tour.rating" :key="'rating+' + tour.id + i"></i>
                                            <i class="fa fa-star" v-for="(v,i) in (5-tour.rating)" :key="'rating-' + tour.id + i"></i>
                                        </a>
                                    </span>
                                    <h1 class="tour-title">
                                        <a :href="tour.tour_detail_url">{{tour.title}}</a>
                                    </h1>
                                    <span class="location"><i class="fa fa-map-marker map-marker"></i>台灣</span>
                                    <div class="tags">
                                        <span v-for="(v,i) in tour.tags" :key="v">{{v}}</span>
                                    </div>
                                </div>

                                <div class="date-price-info">
                                    <ul class="date-list">
                                        <li class="date-item" v-for="(v,i) in tour.group.slice(0, 4)" :key="v.id">
                                            <a :href="'https://www.tripresso.com/detail?group_code=' + v.id + '&tour_key=' + tour.id">
                                                <span class="date">{{v.date | tourDate}}</span>
                                                <span class="quantity">{{(v.quantity<10)?'即將成團':'可售'+v.quantity+'位'}}</span>
                                            </a>
                                        </li>
                                        <li><span class="more-date">更多日期</span></li>
                                    </ul>
                                    <div class="price-info">
                                        <a :href="'https://www.tripresso.com/detail?group_code=' + tour.group[0].id + '&tour_key=' + tour.id">
                                            <div class="price">
                                                <span class="highlight">{{tour.tour_days}}</span>天<span class="highlight"> {{ tour.min_price | tourPrice }}</span>元起
                                            </div>
                                            <div class="discount">
                                                <span class="coin">咖
                                                </span>
                                                下單現賺咖幣
                                                <span class="highlight small">
                                                    $335
                                                </span>
                                                起
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>`,
    computed: {
        tourList() {
            return this.$store.getters.tourList;
        },
    },
    filters: {
        tourPrice(price) {
            return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
        },
        tourDate(date) {
            let day_list = ['日', '一', '二', '三', '四', '五', '六'];
            let theDate = new Date(date);
            let day = theDate.getDay();
            return `${theDate.getMonth()+1}/${theDate.getDate()+1}(${day_list[day]})`;
        },
    }
}

const PageNav = {
    template: `<nav class="page">
                    <ul>
                        <i @click="increasePage(-1)"
                            :class="['fa fa-angle-left' , { 'not-allowed': currentPage == 1 }]"></i>
                        <li v-for="i in pageAmount"
                            v-if="i + 5 > pageAmount"                        
                            @click="changePage(i)"
                            :class="{ 'pageNow': currentPage == i}">{{i}}</li>
                        <i @click="increasePage(1)"
                           :class="['fa fa-angle-right' , { 'not-allowed': currentPage == totalPages }]"></i>
                    </ul>
                </nav>`,
    computed: {
        totalPages() {
            return this.$store.getters.getTotalPages || 1;
        },
        currentPage() {
            return this.$store.getters.currentPage;
        },
        pageAmount() {
            if (this.currentPage < 5) {
                return 5;
            } else if (this.currentPage + 3 > this.totalPages) {
                return this.totalPages;
            } else {
                return this.currentPage + 2;
            }
        }
    },
    methods: {
        changePage(pageNo) {
            if (pageNo <= this.totalPages) {
                this.$store.dispatch('changePage', pageNo);
                this.changeTourList();
            }
            this.scrollFunction();
        },
        increasePage(step) {
            if (step < 0 && this.currentPage !== 1) {
                this.$store.dispatch('changePage', this.currentPage + step);
                this.changeTourList();
            } else if (step >= 0 && this.currentPage !== this.totalPages) {
                this.$store.dispatch('changePage', this.currentPage + step);
                this.changeTourList();
            }
            this.scrollFunction();
        },
        changeTourList() {
            this.$store.dispatch('getTourData');
        },
        scrollFunction() {
            if (document.body.scrollTop > 70 || document.documentElement.scrollTop > 70) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    },
};

const App = {
    components: {
        NavBar,
        TourList,
        PageNav
    },
    template: `<main @click.self="closePriceFilter">
                   <nav-bar></nav-bar>
                   <tour-list></tour-list>
                   <page-nav></page-nav>
               </main>`,
    mounted() {
        this.$store.dispatch('getTourData');
    },
    methods: {
        closePriceFilter() {
            this.$store.dispatch('setPriceFilterShow', false);
        }
    }
}


new Vue({
    store,
    render: h => h(App)
}).$mount('#app')