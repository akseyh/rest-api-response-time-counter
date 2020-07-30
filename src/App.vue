<template>
  <div id="app" style="margin: 0; padding: 0;">
    <vs-input-number label="İstek Sayısı" v-model="numberTest" :disabled="started"/>
    <vs-input-number label="İstekler Arası Gecikme (ms)" v-model="latency" :disabled="started"/>
    <vs-button @click="startTest" :disabled="started">START TEST</vs-button>
    <vs-button @click="clear" :disabled="started" color="danger" style="margin-left: 10px;">RESET</vs-button>
    <div style="display: flex; flex-direction: row; width: 100%; align-items: center; justify-content: space-around;">
      <div style="height: 500px; width: 50%">
        <h1>FETCH DIRECT</h1>
        <div style="height: 150px;">
          <b>Başlangıç Zamanı: {{startTimeDirect}}</b><br/>
          <b>Bitiş Zamanı: {{endTimeDirect}}</b><br />
          <b>Completed: {{completedDirect + ' / ' + numberTest}}</b><br />
          <b>Min: {{minResTimeDirect}}ms</b><br />
          <b>Max: {{maxResTimeDirect}}ms</b>
        </div>
        <ag-grid
          :columnPropData="columnDataDirect" 
          :rowPropData="rowDataDirect"
          :key="componentKeyDirect"
          ref="gridDirect"
        ></ag-grid>
      </div>
      <div style="height: 500px; width: 50%">
        <h1>FETCH EXECUTE</h1>
        <div style="height: 150px;">
          <b>Başlangıç Zamanı: {{startTimeExecute}}</b><br/>
          <b>Bitiş Zamanı: {{endTimeExecute}}</b><br />
          <b>Completed: {{completedExecute + ' / ' + numberTest}}</b><br />
          <b>Min: {{minResTimeExecute}}ms</b><br />
          <b>Max: {{maxResTimeExecute}}ms</b>
        </div>
        <ag-grid
          :columnPropData="columnDataExecute" 
          :rowPropData="rowDataExecute"
          :key="componentKeyExecute"
          ref="gridExecute"
        ></ag-grid>
      </div>
    </div>
  </div>
</template>

<script>
import agGrid from './components/agGrid'
export default {
  name: 'App',
  components: {agGrid},
  data() {
    return {
      componentKeyDirect  : 0,
      componentKeyExecute : 99,
      started             : false,
      latency             : 1,
      numberTest          : 1,
      completedDirect     : 0,
      completedExecute    : 0,
      startTimeDirect     : null,
      startTimeExecute    : null,
      endTimeDirect       : null,
      endTimeExecute      : null,
      minResTimeExecute   : null,
      minResTimeDirect    : null,
      maxResTimeExecute   : null,
      maxResTimeDirect    : null,
      rowDataDirect       : [],
      rowDataExecute      : [],
      CustomerID          : '315BF175-9FBB-EA11-A2E2-000C293978ED',
      columnDataDirect    : [
        {
          headerName: 'Başlangıç Zamanı',
          field: 'StartTime'
        },
        {
          headerName: 'Bitiş Zamanı',
          field: 'EndTime'
        },
        {
          headerName: 'Fark (ms)',
          field: 'Fark'
        }
      ],
      columnDataExecute   : [
        {
          headerName: 'Başlangıç Zamanı',
          field: 'StartTime'
        },
        {
          headerName: 'Bitiş Zamanı',
          field: 'EndTime'
        },
        {
          headerName: 'Fark (ms)',
          field: 'Fark'
        }
      ]
    }
  },
  methods: {
    fetchDataByDirect() {
      const me = this
      return new Promise((resolve) => {
        let startTime = new Date()
        var data = new FormData();
        data.append("CustomerID", this.CustomerID);
  
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
  
        xhr.addEventListener("readystatechange", function() {
          if(this.readyState === 4) {
            me.completedDirect++
            if(me.completedDirect == me.numberTest) me.endTimeDirect = me.timeFormat(new Date())
            let endTime = new Date()
            let resTime = endTime.getTime() - startTime.getTime()
            if(resTime < me.minResTimeDirect || me.minResTimeDirect === null) me.minResTimeDirect = resTime
            if(resTime > me.maxResTimeDirect || me.maxResTimeDirect === null) me.maxResTimeDirect = resTime
            me.$refs.gridDirect.addData({
              'StartTime' : me.timeFormat(startTime).toString(),
              'EndTime'   : me.timeFormat(endTime).toString(),
              'Fark'      : resTime
            })
            resolve()
          }
        });
  
        xhr.open("POST", "http://192.168.1.87:9090/api/ScopeExecuteSp/get");
  
        xhr.send(data);
      })
    },
    fetchDataByExecute() {
      const me = this
      return new Promise((resolve) => {
        let startTime = new Date()
        var data = new FormData();
        data.append("CustomerID", this.CustomerID);
  
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
  
        xhr.addEventListener("readystatechange", function() {
          if(this.readyState === 4) {
            me.completedExecute++
            if(me.completedExecute == me.numberTest) me.endTimeExecute = me.timeFormat(new Date())
            let endTime = new Date()
            let resTime = endTime.getTime() - startTime.getTime()
            if(resTime < me.minResTimeExecute || me.minResTimeExecute === null) me.minResTimeExecute = resTime
            if(resTime > me.maxResTimeExecute || me.maxResTimeExecute === null) me.maxResTimeExecute = resTime
            me.$refs.gridExecute.addData({
              'StartTime' : me.timeFormat(startTime).toString(),
              'EndTime'   : me.timeFormat(endTime).toString(),
              'Fark'      : resTime
            })
            resolve()
          }
        });
  
        xhr.open("POST", "http://192.168.1.87:9090/api/SingletonExecuteSp/get");
  
        xhr.send(data);
      })
    },
    timeFormat(date) {
      return `${date.getHours()}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getSeconds()).slice(-2)}.${date.getMilliseconds()}`
    },
    setData (el) {
      this.rowData = []
      el.forEach(el => {
        this.rowData.push(el)
      })
    },
    async startTest() {
      this.clear()
      this.started = true
      let date = this.timeFormat(new Date())
      this.startTimeExecute = date
      this.startTimeDirect = date
      for(let i = 0; i<this.numberTest; i++) {
        this.fetchDataByExecute()
        this.fetchDataByDirect()
        await this.delay()
      }
      this.started = false
    },
    delay() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, this.latency);
      })
    },
    clear() {
      this.completedDirect   = 0
      this.completedExecute  = 0
      this.startTimeDirect   = null
      this.startTimeExecute  = null
      this.endTimeDirect     = null
      this.endTimeExecute    = null
      this.minResTimeExecute = null
      this.minResTimeDirect  = null
      this.maxResTimeExecute = null
      this.maxResTimeDirect  = null
      this.rowDataDirect     = []
      this.rowDataExecute    = []
      this.componentKeyDirect++
      this.componentKeyExecute++
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
