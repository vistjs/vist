import { useState, useEffect } from 'react';
import './styles.css';

function Page() {
  function onChangeInput(ev: any) {
    console.log(`onChangeInput, ${ev.target.value}`);
  }

  function onChangeCheckbox1(ev: any) {
    console.log(`onChangeCheckbox1, ${ev.target.checked}`);
  }

  function onChangeCheckbox2(ev: any) {
    console.log(`onChangeCheckbox2, ${ev.target.checked}`);
  }

  function onChangeRadio1(ev: any) {
    console.log(`onChangeRadio1, ${ev.target.checked}`);
  }

  function onChangeRadio2(ev: any) {
    console.log(`onChangeRadio2, ${ev.target.checked}`);
  }

  function onChangeRadio3(ev: any) {
    console.log(`onChangeRadio3, ${ev.target.checked}`);
  }

  function onChangeSelect(ev: any) {
    console.log(`onChangeSelect, ${ev.target.value}`);
  }

  useEffect(() => {
    fetch('https://63459b8739ca915a6903c126.mockapi.io/api/users')
      .then((response) => response.json())
      .then((json) => console.log(json));
  }, []);

  return (
    <div className="form-page">
      <form>
        <div>
          <label htmlFor="uname">Choose a username1: </label>
          <input type="text" id="uname" name="name" onChange={onChangeInput} />
        </div>
        <div>
          <input type="checkbox" id="cbox1" value="first_checkbox" onChange={onChangeCheckbox1} />
          <label htmlFor="cbox1">This is the first checkbox</label>
        </div>
        <div>
          <input type="checkbox" id="cbox2" value="second_checkbox" defaultChecked onChange={onChangeCheckbox2} />
          <label htmlFor="cbox2">This is the second checkbox, which is checked</label>
        </div>
        <p>Please select your preferred contact method:</p>
        <div>
          <input type="radio" id="contactChoice1" name="contact" value="email" onChange={onChangeRadio1} />
          <label htmlFor="contactChoice1">Email</label>

          <input type="radio" id="contactChoice2" name="contact" value="phone" onChange={onChangeRadio2} />
          <label htmlFor="contactChoice2">Phone</label>

          <input type="radio" id="contactChoice3" name="contact" value="mail" onChange={onChangeRadio3} />
          <label htmlFor="contactChoice3">Mail</label>
        </div>

        <label htmlFor="pet-select">Choose a pet:</label>
        <select name="pets" id="pet-select" onChange={onChangeSelect}>
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
  );
}

export default Page;
