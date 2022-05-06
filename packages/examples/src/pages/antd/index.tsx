import { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import {
  Tooltip,
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  DatePicker,
  Space,
  Slider,
  Switch,
  Radio,
  Checkbox,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import './index.css';
const { Option } = Select;

const text = <span>prompt text</span>;

const buttonWidth = 70;

function Page() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  function onChangeInput(e: any) {
    console.log(`change ${e.target.value}`);
  }

  function onChangeSwitch(checked: boolean) {
    console.log(`switch to ${checked}`);
  }

  function onChangeRadio(e: any) {
    console.log(`radio checked = ${e.target.checked}`);
  }

  function onChangeCheckbox(e: any) {
    console.log(`checkbox checked = ${e.target.checked}`);
  }

  return (
    <div>
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        New account
      </Button>
      <Drawer
        title="Create a new account"
        width={720}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onClose} type="primary">
              Submit
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name2" rules={[{ required: true, message: 'Please enter user name' }]}>
                <Input placeholder="Please enter user name" onChange={onChangeInput} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="url" label="Url" rules={[{ required: true, message: 'Please enter url' }]}>
                <Input
                  style={{ width: '100%' }}
                  addonBefore="http://"
                  addonAfter=".com"
                  placeholder="Please enter url"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="owner" label="Owner" rules={[{ required: true, message: 'Please select an owner' }]}>
                <Select placeholder="Please select an owner">
                  <Option value="xiao">Xiaoxiao Fu</Option>
                  <Option value="mao">Maomao Zhou</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please choose the type' }]}>
                <Select placeholder="Please choose the type">
                  <Option value="private">Private</Option>
                  <Option value="public">Public</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="approver"
                label="Approver"
                rules={[{ required: true, message: 'Please choose the approver' }]}
              >
                <Select placeholder="Please choose the approver">
                  <Option value="jack">Jack Ma</Option>
                  <Option value="tom">Tom Liu</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateTime"
                label="DateTime"
                rules={[{ required: true, message: 'Please choose the dateTime' }]}
              >
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: 'please enter url description',
                  },
                ]}
              >
                <Input.TextArea rows={4} placeholder="please enter url description" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="slider" label="Slider">
                <Slider
                  marks={{
                    0: 'A',
                    20: 'B',
                    40: 'C',
                    60: 'D',
                    80: 'E',
                    100: 'F',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="switch" label="Switch">
                <Switch defaultChecked onChange={onChangeSwitch} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="radio" label="Radio">
                <Radio onChange={onChangeRadio}>Radio</Radio>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="checkbox" label="Checkbox">
                <Checkbox onChange={onChangeCheckbox}>Checkbox</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <div className="antd-page">
        <div style={{ marginLeft: buttonWidth, whiteSpace: 'nowrap' }}>
          <Tooltip placement="topLeft" title={text}>
            <Button>TL</Button>
          </Tooltip>
          <Tooltip placement="top" title={text}>
            <Button>Top</Button>
          </Tooltip>
          <Tooltip placement="topRight" title={text}>
            <Button>TR</Button>
          </Tooltip>
        </div>
        <div style={{ width: buttonWidth, float: 'left' }}>
          <Tooltip placement="leftTop" title={text}>
            <Button>LT</Button>
          </Tooltip>
          <Tooltip placement="left" title={text}>
            <Button>Left</Button>
          </Tooltip>
          <Tooltip placement="leftBottom" title={text}>
            <Button>LB</Button>
          </Tooltip>
        </div>
        <div style={{ width: buttonWidth, marginLeft: buttonWidth * 4 + 24 }}>
          <Tooltip placement="rightTop" title={text}>
            <Button>RT</Button>
          </Tooltip>
          <Tooltip placement="right" title={text}>
            <Button>Right</Button>
          </Tooltip>
          <Tooltip placement="rightBottom" title={text}>
            <Button>RB</Button>
          </Tooltip>
        </div>
        <div style={{ marginLeft: buttonWidth, clear: 'both', whiteSpace: 'nowrap' }}>
          <Tooltip placement="bottomLeft" title={text}>
            <Button>BL</Button>
          </Tooltip>
          <Tooltip placement="bottom" title={text}>
            <Button>Bottom</Button>
          </Tooltip>
          <Tooltip placement="bottomRight" title={text}>
            <Button>BR</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default Page;
