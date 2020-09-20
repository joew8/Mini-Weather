var app = new Vue({
    el: "#app",
    data: {
        placeholder: "Search City",
        userIn: "",
        city: "",
        cityKey: "349727",
        clientIp: "",
        weather: [],
        weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        listShow: false,
    },
    methods: {
        getIp: function () {
            axios.get("https://api.ipify.org/").then((responce) => {
                this.clientIp = responce.data;
                console.log("client ip: " + this.clientIp);
            });
        },

        async getKeyByIp() {
            await axios
                .get(
                    "http://dataservice.accuweather.com/locations/v1/cities/ipaddress?apikey=6pB420Mf807ZuHYKd9xOh5rBNlKRvhRI&q=" +
                        this.clientIp
                )
                .then((responce) => {
                    this.cityKey = responce.data.ParentCity.Key;
                    console.log(
                        "key of this ip is:" + this.cityKey
                    );
                    this.city =
                        responce.data.ParentCity.EnglishName;
                });
        },

        getWeatherByDefaultCity: function (cityName, key) {
            this.city = cityName;
            this.getWeatherByKey(key);
        },

        getWeatherByCitySearch: function (input) {
            // Get the key of the city from the user input
            axios
                .get(
                    "http://dataservice.accuweather.com/locations/v1/cities/search?apikey=6pB420Mf807ZuHYKd9xOh5rBNlKRvhRI&q=" +
                        input
                )
                .then((responce) => {
                    this.cityKey = responce.data[0].Key;
                    this.city = responce.data[0].EnglishName;
                    // Get the weather by the key
                    this.getWeatherByKey(this.cityKey);
                });
        },

        getWeatherByKey: function (Key) {
            console.log("get weather by key " + Key);
            axios
                .get(
                    "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" +
                        Key +
                        "?apikey=6pB420Mf807ZuHYKd9xOh5rBNlKRvhRI&language=en&metric=true"
                )
                .then((responce) => {
                    this.weather = responce.data.DailyForecasts;
                    localStorage.setItem(
                        "weather",
                        JSON.stringify(responce.data.DailyForecasts)
                    );
                    console.log("weather updated");
                });
        },
    },
    async created() {
        this.getIp();
        await this.getKeyByIp();

        // Load data from local storage
        this.weather = JSON.parse(localStorage.getItem("weather"));

        if (this.weather) {
            console.log("Source: localStorage");
            var localWeather = JSON.parse(
                localStorage.getItem("weather")
            );
            // Check if the data is up-to-date
            if (
                new Date(this.weather[0].Date).getDate() ==
                new Date().getDate()
            ) {
                console.log("up-to-date weather data, all good!");
            } else {
                this.getWeatherByKey(this.cityKey);
                console.log(
                    "out-of-date weather data. Renew done."
                );
            }
        } else {
            this.getWeatherByKey(this.cityKey);
        }
    },
});