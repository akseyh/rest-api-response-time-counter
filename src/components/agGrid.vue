<template>
   <div>
      <ag-grid-vue
                     :gridOptions="gridOptions"
                     :columnDefs="columnDefs"
                     :rowData="rowData"
                     :modules="modules"
                     :defaultColDef="defaultColDef"
                     style="height: 55vh;"
                     :animateRows="true"
                     class="ag-theme-alpine ag-grid-table"
      ></ag-grid-vue>
   </div>
</template>

<script>
import {AgGridVue} from 'ag-grid-vue'
import {AllCommunityModules} from '@ag-grid-community/all-modules'
export default {
  name: 'AgGridExample',
  components: {
    AgGridVue
  },
  props: {
    columnPropData: {default: []},
    rowPropData: {default: []}
  },  
  data () {
    return {
      gridOptions: null,
      gridApi: null,
      columnApi: null,
      columnDefs: null,
      defaultColDef: null,
      modules: [
        AllCommunityModules
      ],
      rowData: []
    }
  },
  methods: {
     addData(data) {
        this.gridApi.updateRowData({add: [data]})
     }
  },
  beforeMount () {
    this.gridOptions = {}
    this.columnDefs = this.columnPropData
    this.rowData = this.rowPropData
    this.defaultColDef = {
      resizable: true,
      sortable: true,
      floatingFilter: true
    }
  },
  mounted () {
    this.gridApi = this.gridOptions.api
    this.gridColumnApi = this.gridOptions.columnApi
  }
}
</script>

<style>
  .active-item{
    box-shadow: rgba(39, 11, 11, 0.75) 0px 0px 20px 0px;
  }
</style>
