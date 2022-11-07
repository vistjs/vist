<template>
  <div>
    <div style="height: 2000px; display: flex; flex-direction: column; justify-content: space-around">
      <p>翻滚吧，你就能看到下面的按钮了</p>
      <p>翻滚吧，你就能看到下面的按钮了</p>
      <p>翻滚吧，你就能看到下面的按钮了</p>
      <p>翻滚吧，你就能看到下面的按钮了</p>
      <p>翻滚吧，你就能看到下面的按钮了</p>
    </div>
    <a-button type="primary" @click="showDrawer">
      <template #icon><PlusOutlined /></template>
      New account
    </a-button>
    <a-drawer
      title="Create a new account"
      :width="720"
      @close="onClose"
      :visible="visible"
      :body-style="{ paddingBottom: '80px' }"
    >
      <a-form layout="vertical" :model="form" :rules="rules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" label="Name">
              <a-input v-model:value="form.name" placeholder="Please enter user name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="url" label="Url">
              <a-input
                v-model:value="form.url"
                style="width: 100%"
                addon-before="http://"
                addon-after=".com"
                placeholder="Please enter url"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="owner" label="Owner">
              <a-select v-model:value="form.owner" placeholder="Please select an owner">
                <a-select-option value="xiao">Xiaoxiao Fu</a-select-option>
                <a-select-option value="mao">Maomao Zhou</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="type" label="Type">
              <a-select v-model:value="form.type" placeholder="Please choose the type">
                <a-select-option value="private">Private</a-select-option>
                <a-select-option value="public">Public</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="approver" label="Approver">
              <a-select v-model:value="form.approver" placeholder="Please choose the approver">
                <a-select-option value="jack">Jack Ma</a-select-option>
                <a-select-option value="tom">Tom Liu</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="dateTime" label="DateTime">
              <a-range-picker v-model:value="form.dateTime" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item name="description" label="Description">
              <a-textarea v-model:value="form.description" :rows="4" placeholder="please enter url description" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="slider" label="Slider">
              <a-slider
                v-model:value="form.slider"
                :marks="{
                  0: 'A',
                  20: 'B',
                  40: 'C',
                  60: 'D',
                  80: 'E',
                  100: 'F',
                }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="switch" label="Switch">
              <a-switch v-model:checked="form.switch" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="radio" label="Radio">
              <a-radio v-model:checked="form.radio">Radio</a-radio>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="checkbox" label="Checkbox">
              <a-checkbox v-model:checked="form.checkbox">Checkbox</a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #extra>
        <a-space>
          <a-button @click="onClose">Cancel</a-button>
          <a-button type="primary" @click="onClose">Submit</a-button>
        </a-space>
      </template>
    </a-drawer>
    <div className="antd-page">
      <div :style="{ marginLeft: `${buttonWidth}px`, whiteSpace: 'nowrap' }">
        <a-tooltip placement="topLeft" title="prompt text">
          <a-button>TL</a-button>
        </a-tooltip>
        <a-tooltip placement="top" title="prompt text">
          <a-button>Top</a-button>
        </a-tooltip>
        <a-tooltip placement="topRight" title="prompt text">
          <a-button>TR</a-button>
        </a-tooltip>
      </div>
      <div :style="{ width: `${buttonWidth}px`, float: 'left' }">
        <a-tooltip placement="leftTop" title="prompt text">
          <a-button>LT</a-button>
        </a-tooltip>
        <a-tooltip placement="left" title="prompt text">
          <a-button>Left</a-button>
        </a-tooltip>
        <a-tooltip placement="leftBottom" title="prompt text">
          <a-button>LB</a-button>
        </a-tooltip>
      </div>
      <div :style="{ width: `${buttonWidth}px`, marginLeft: `${buttonWidth * 4 + 24}px` }">
        <a-tooltip placement="rightTop" title="prompt text">
          <a-button>RT</a-button>
        </a-tooltip>
        <a-tooltip placement="right" title="prompt text">
          <a-button>Right</a-button>
        </a-tooltip>
        <a-tooltip placement="rightBottom" title="prompt text">
          <a-button>RB</a-button>
        </a-tooltip>
      </div>
      <div :style="{ marginLeft: `${buttonWidth}px`, clear: 'both', whiteSpace: 'nowrap' }">
        <a-tooltip placement="bottomLeft" title="prompt text">
          <a-button>BL</a-button>
        </a-tooltip>
        <a-tooltip placement="bottom" title="prompt text">
          <a-button>Bottom</a-button>
        </a-tooltip>
        <a-tooltip placement="bottomRight" title="prompt text">
          <a-button>BR</a-button>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue';
import type { Rule } from 'ant-design-vue/es/form';

const buttonWidth = 70;

const form = reactive({
  name: '',
  url: '',
  owner: '',
  type: '',
  approver: '',
  dateTime: null,
  description: '',
  slider: 20,
  switch: true,
  radio: false,
  checkbox: true,
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: 'Please enter user name' }],
  url: [{ required: true, message: 'please enter url' }],
  owner: [{ required: true, message: 'Please select an owner' }],
  type: [{ required: true, message: 'Please choose the type' }],
  approver: [{ required: true, message: 'Please choose the approver' }],
  dateTime: [{ required: true, message: 'Please choose the dateTime', type: 'object' }],
  description: [{ required: true, message: 'Please enter url description' }],
};

const visible = ref<boolean>(false);
function showDrawer() {
  visible.value = true;
}
function onClose() {
  visible.value = false;
}
</script>

<style>
.antd-page .ant-btn {
  margin-right: 8px;
  margin-bottom: 8px;
}
.antd-page .ant-btn-rtl {
  margin-right: 0;
  margin-left: 8px;
  margin-bottom: 8px;
}
.antd-page .ant-btn {
  width: 70px;
  text-align: center;
  padding: 0;
}
</style>
