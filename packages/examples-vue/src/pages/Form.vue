<template>
  <div className="form-page">
    <form>
      <div>
        <label for="uname">Choose a username3: </label>
        <input type="text" id="uname" name="name" />
      </div>
      <div>
        <input type="checkbox" id="cbox1" value="first_checkbox" />
        <label for="cbox1">This is the first checkbox</label>
      </div>
      <div>
        <input type="checkbox" id="cbox2" value="second_checkbox" checked="checked" />
        <label for="cbox2">This is the second checkbox, which is checked</label>
      </div>
      <p>Please select your preferred contact method:</p>
      <div>
        <input type="radio" id="contactChoice1" name="contact" value="email" />
        <label for="contactChoice1">Email</label>

        <input type="radio" id="contactChoice2" name="contact" value="phone" />
        <label for="contactChoice2">Phone</label>

        <input type="radio" id="contactChoice3" name="contact" value="mail" />
        <label for="contactChoice3">Mail</label>
      </div>

      <label for="pet-select">Choose a pet:</label>
      <select name="pets" id="pet-select">
        <option value="">--Please choose an option--</option>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="hamster">Hamster</option>
        <option value="parrot">Parrot</option>
        <option value="spider">Spider</option>
        <option value="goldfish">Goldfish</option>
      </select>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

onMounted(() => {
  fetch('https://63459b8739ca915a6903c126.mockapi.io/api/users')
    .then((response) => response.json())
    .then((json) => console.log(json));

  fetch('https://63459b8739ca915a6903c12.mockapi.io/api/users')
    .then((response) => response.json())
    .then((json) => console.log(json));
});
</script>
<style>
.form-page {
  display: flex;
  flex-direction: column;
  margin: 20px;
  margin-left: 50px;
}
</style>
