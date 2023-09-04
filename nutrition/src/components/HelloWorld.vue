

<template>
  <v-data-table
    :headers="headers"
    :items="foodItems"
    :sort-by="[{ key: 'calories', order: 'asc' }]"
    class="elevation-1"
  >
    <template v-slot:top>
      <div class="text-grey">Search Ingredients</div>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Ingredients Table</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="props"
            >
              New Item
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.name"
                      label="Item name"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.quantity"
                      label="Quantity (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.calories"
                      label="Calories"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.fat"
                      label="Fat (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.carbs"
                      label="Carbs (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.protein"
                      label="Protein (g)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        @click="editItem(item.raw)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        @click="deleteItem(item.raw)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>
  <!--<h1>Calories: {{ sumField('calories') }} </h1>-->
  <!--<h1>{{ totals }}</h1>
  <h1>Carbs: {{ totals.carbs }}</h1>
  <h1>Protein: {{totals.protein }}</h1>-->
  <h1>Calories: {{ this.caloriesSum}}</h1>
  <h1>Protein: {{ this.proteinSum }}</h1>
</template>

<script>

  export default {
    data: () => ({
      dialog: false,
      dialogDelete: false,
      headers: [
        {
          title: 'Item',
          align: 'start',
          sortable: false,
          key: 'name',
        },
        { title: 'Quantity', key: 'quantity' },
        { title: 'Calories', key: 'calories' },
        { title: 'Fat (g)', key: 'fat' },
        { title: 'Carbs (g)', key: 'carbs' },
        { title: 'Protein (g)', key: 'protein' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      foodItems: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        quantity: 0,
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
      },
      defaultItem: {
        name: '',
        quantity: 0,
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
      },
      caloriesSum: 335,
      proteinSum: 38,
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.caloriesSum = 335;
        this.proteinSum = 38;
        this.foodItems = [
          {
            name: 'Chicken',
            quantity: 140,
            calories: 335,
            fat: 19.0,
            carbs: 0,
            protein: 38,
          },
          
        ]
      },
      //https://codepen.io/fontzter/pen/BEdKXK
      /*
      totals() {
        console.log('hi you called totals')
        const totals = this.foodItems.reduce((acc, d) => {
          acc.calories += d.calories
          acc.protein += d.protein
          return acc
        }, {
          calories: 0,
          protein: 0
        })
        return totals;
      },
      */
     /*
     totals() {
      console.log('you have entered totals')
      console.log('what the fuck food items is not defined');
      console.log(this.foodItems);
      let totals = [];
      for(let i = 0; i < this.foodItems.length; i++) {
        this.caloriesSum += this.foodItems[i].calories;
        this.proteinSum += this.foodItems[i].protein;
      }
      totals.push(this.caloriesSum);
      totals.push(this.proteinSum);
      return totals;
     },
     */

      editItem (item) {
        this.editedIndex = this.foodItems.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.foodItems.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.caloriesSum -= parseInt(item.calories);
        this.proteinSum -= parseInt(item.protein);
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        this.foodItems.splice(this.editedIndex, 1)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.foodItems[this.editedIndex], this.editedItem)
        } else {
          this.foodItems.push(this.editedItem)
        }
        this.caloriesSum += parseInt(this.editedItem.calories);
        this.proteinSum += parseInt(this.editedItem.protein);
        this.close()
      },
    },
  }
</script>