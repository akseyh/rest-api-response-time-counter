<template>
  <div id="app" style="margin: 0; padding: 0; margin-top: 10px;">
    <h1 style="margin-bottom: 10px;">RESPONSE TIME COUNTER</h1>
    <vs-input-number label="İstek Sayısı" v-model="numberTest" :disabled="started"/>
    <vs-input-number label="İstekler Arası Gecikme (ms)" v-model="latency" :disabled="started"/>
    <div style="display: flex; align-items: center; justify-content: center; width: 100%">
      <div style="text-align: left;">
        <span>Metod</span>
        <multiselect v-model="selectedMethod" :options="methods" :disabled="started"></multiselect>
      </div>
      <div style="margin-left: 10px; text-align: left;">
        <span>URL</span>
        <vs-input v-model="url" style="width: 600px;" :disabled="started"></vs-input>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: center; width: 100%">
      <div style="margin-left: 10px; text-align: left;">
        <span>BODY (JSON)</span>
        <vs-input v-model="body" style="width: 600px;" :disabled="started"></vs-input>
      </div>
      <div style="margin-left: 10px; text-align: left;">
        <span>HEADER (JSON)</span>
        <vs-input v-model="header" style="width: 600px;" :disabled="started"></vs-input>
      </div>
    </div>
    <div style="margin-top: 15px;">
      <vs-button @click="started ? stopTest() : startTest()" :disabled="!isValid" :color="started ? 'danger' : 'primary'">{{started ? 'DURDUR' : 'TESTİ BAŞLAT'}}</vs-button>
      <vs-button @click="clear" :disabled="started" color="danger" style="margin-left: 10px;">TEMİZLE</vs-button>
    </div>
    <div style="display: flex; flex-direction: row; width: 100%; align-items: center; justify-content: center; margin-top: 15px;">
      <div style="height: 500px; width: 50%">
        <div style="height: auto; display: flex;">
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-end; flex-wrap: nowrap">
            <b>Başlangıç Zamanı:  </b><br/>
            <b>Bitiş Zamanı:      </b><br/>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-start; margin-left: 10px;">
            <span>{{startTimeExecute || '-'}} </span><br/>
            <span>{{endTimeExecute || '-'}} </span><br/>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-end;">
            <b>İstek Atılan:      </b><br/>
            <b>Tamamlanan:        </b><br/>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-start; margin-left: 10px;">
            <span>{{sendedReq + ' / '}} <b>{{numberTest}}</b></span><br/>
            <span>{{completedExecute + ' / '}} <b>{{numberTest}}</b></span><br/>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-end;">
            <b>Min:               </b><br/>
            <b>Max:               </b>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-start; margin-left: 10px;">
            <span>{{minResTimeExecute | msWrite}}</span><br/>
            <span>{{maxResTimeExecute | msWrite}}</span>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-end;">
            <b>Avg:               </b>
          </div>
          <div style="width: 16%; display: flex; flex-direction: column; align-items: flex-start; margin-left: 10px;">
            <span>{{avg | msWrite}}              </span>
          </div>
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
import Multiselect from 'vue-multiselect'
export default {
  name: 'App',
  components: {agGrid, Multiselect},
  data() {
    return {
      componentKeyExecute : 99,
      started             : false,
      latency             : 1,
      numberTest          : 1,
      completedExecute    : 0,
      sendedReq           : 0,
      avg                 : 0,
      startTimeExecute    : null,
      endTimeExecute      : null,
      minResTimeExecute   : null,
      maxResTimeExecute   : null,
      rowDataExecute      : [],
      body                : '{"request": {"action":"TaskAnalysisByDay","version":"1"}}',
      header              : '{ "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJQcm9qZWN0SUQiOiJjMGE0NmYyMi0yOWYwLTRjZjUtYTgyMS1jYzJhNTk2OWQzODMiLCJVc2VySW5mbyI6IntcIlVzZXJJRFwiOlwiNDJhOGZiOGItOWZmOS00NThjLTg0ZWYtOTViNDVmMjgwZWMyXCIsXCJFbWFpbFwiOlwic2VtaWhjZXRpbjM0QGdtYWlsLmNvbVwiLFwiRmlyc3ROYW1lXCI6XCJTZW1paFwiLFwiTGFzdE5hbWVcIjpcIsOHRVTEsE5cIixcIlBob25lTnVtYmVyXCI6XCJOT05FXCIsXCJCaXJ0aERhdGVcIjpcIlwiLFwiR2VuZGVyXCI6XCJcIixcIkFkZHJlc3NcIjpcIlwiLFwiSXNDb25maXJtXCI6dHJ1ZX0iLCJuYmYiOjE1OTYwOTc5NjIsImV4cCI6MTYyNzYzMzk2MiwiaXNzIjoiQGZpbnRlY2h5YXppbGltIiwiYXVkIjoiQGZpbnRlY2h5YXppbGltIn0.9vRPQsAK3714ZRpTgWUU0IeL6NhgKPtZM4oaj7OOArA" }',
      url                 : 'http://77.92.133.194:52013/api/FinTech/ExecuteFormData',
      token               : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJQcm9qZWN0SUQiOiJjMGE0NmYyMi0yOWYwLTRjZjUtYTgyMS1jYzJhNTk2OWQzODMiLCJVc2VySW5mbyI6IntcIlVzZXJJRFwiOlwiNDJhOGZiOGItOWZmOS00NThjLTg0ZWYtOTViNDVmMjgwZWMyXCIsXCJFbWFpbFwiOlwic2VtaWhjZXRpbjM0QGdtYWlsLmNvbVwiLFwiRmlyc3ROYW1lXCI6XCJTZW1paFwiLFwiTGFzdE5hbWVcIjpcIsOHRVTEsE5cIixcIlBob25lTnVtYmVyXCI6XCJOT05FXCIsXCJCaXJ0aERhdGVcIjpcIlwiLFwiR2VuZGVyXCI6XCJcIixcIkFkZHJlc3NcIjpcIlwiLFwiSXNDb25maXJtXCI6dHJ1ZX0iLCJuYmYiOjE1OTYwMzYxNjksImV4cCI6MTYyNzU3MjE2OSwiaXNzIjoiQGZpbnRlY2h5YXppbGltIiwiYXVkIjoiQGZpbnRlY2h5YXppbGltIn0.XLDJwdWNe75fuv46Dzwn_YXC6BvwhHksjK4dw4ehQwI',
      selectedMethod      : 'POST',
      methods             : ['GET', 'POST'],
      CustomerID          : '315BF175-9FBB-EA11-A2E2-000C293978ED',
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
        },
        {
          headerName: 'Status',
          field: 'Status',
          cellStyle: (params) => {
            return { backgroundColor: params.data.Status === 200 ? 'green' : 'red', color: 'white' }
          }
        }
      ]
    }
  },
  computed: {
    isValid() { 
      return this.selectedMethod && this.url && this.validURL(this.url)
    },
    isTestCompleted() {
      return this.completedExecute === this.numberTest && this.sendedReq === this.numberTest
    }
  },
  watch: {
    numberTest() { this.clear() },
    latency() { this.clear() }
  },
  filters: {
    msWrite(val) {
      return val ? `${val}ms` : '-'
    }
  },
  methods: {
    fetchDataByExecute() {
      const me = this
      return new Promise((resolve) => {
        let startTime = new Date()
        var data = new FormData();

        let params = JSON.parse(this.body)
        for (let [key, value] of Object.entries(params)) {
          if(typeof value === 'object') value = JSON.stringify(value)
          data.append(key, value)
        }

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
  
        xhr.addEventListener("readystatechange", function() {
          if(this.readyState === 4) {
            let status = this.status
            me.completedExecute++
            if(me.completedExecute == me.numberTest) me.endTimeExecute = me.timeFormat(new Date())
            let endTime = new Date()
            let resTime = endTime.getTime() - startTime.getTime()
            if(resTime < me.minResTimeExecute || me.minResTimeExecute === null) me.minResTimeExecute = resTime
            if(resTime > me.maxResTimeExecute || me.maxResTimeExecute === null) me.maxResTimeExecute = resTime
            me.$refs.gridExecute.addData({
              'StartTime' : me.timeFormat(startTime).toString(),
              'EndTime'   : me.timeFormat(endTime).toString(),
              'Fark'      : resTime,
              'Status'    : status
            })
            // this.avg = this.avg * 
            let respTimes = me.$refs.gridExecute.gridApi.getModel().rootNode.allLeafChildren.map(el => el.data.Fark)
            me.avg = (respTimes.reduce((pre, cur) => { return pre + cur }) / respTimes.length).toFixed(1)
            resolve()
          }
        });
  
        xhr.open(this.selectedMethod, this.url);


        let headers = JSON.parse(this.header)
        for (let [key, value] of Object.entries(headers)) {
          if(typeof value === 'object') value = JSON.stringify(value)
          xhr.setRequestHeader(key, value)
        }

        xhr.send(data);
      })
    },
    timeFormat(date) {
      return `${date.getHours()}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getSeconds()).slice(-2)}.${('00'+date.getMilliseconds()).slice(-3)}`
    },
    async startTest() {
      this.clear()
      this.started = true
      let date = this.timeFormat(new Date())
      this.startTimeExecute = date
      for(let i = 0; i<this.numberTest; i++) {
        if(!this.started) return
        this.sendedReq++
        this.fetchDataByExecute()
        await this.delay()
      }
      this.started = false
    },
    stopTest () {
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
      this.completedExecute  = 0
      this.sendedReq         = 0
      this.avg               = 0
      this.startTimeExecute  = null
      this.endTimeExecute    = null
      this.minResTimeExecute = null
      this.maxResTimeExecute = null
      this.rowDataExecute    = []
      this.componentKeyExecute++
    },
    validURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(str);
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
b {
  white-space: nowrap;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
