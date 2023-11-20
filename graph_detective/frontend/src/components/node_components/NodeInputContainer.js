import { AttributeEditor } from './AttributeEditor';
import { OperatorEditor } from './OperatorEditor';
import { ValueEditor } from './ValueEditor';

export const NodeInputContainer = ({
  data,
  editType,
  selectedAttribute, setSelectedAttribute,
  selectedAttributeType,
  selectedOperator, setSelectedOperator,
  selectedValue, setSelectedValue,
  valueOptions, setValueOptions
}) => {
  const { attributeOptions } = data

  // TODO Get and set value options whenever the attribute changes. Discuss what values should be loaded from database

  return (
    <div className="nodeInputContainer">
      {editType == 0 &&
        <AttributeEditor
          attributeOptions={attributeOptions.map((obj) => obj.key)}
          selectedAttribute={selectedAttribute}
          setSelectedAttribute={setSelectedAttribute}
        />
      }
      {editType == 1 &&
        <OperatorEditor
          selectedOperator={selectedOperator}
          setSelectedOperator={setSelectedOperator}
          selectedAttributeType={selectedAttributeType}
        />}
      {editType == 2 &&
        <ValueEditor
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          valueOptions={valueOptions}
          selectedAttributeType={selectedAttributeType}
        />}
    </div>
  );
}