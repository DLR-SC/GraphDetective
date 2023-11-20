interface EdgeData {
    edgeId: string,
    name: string,
    isPath: boolean,
    minLength: number, 
    maxLength: number,
    props: {
      datatype: string,
      key: string,
      samplevalue: string,
      userValue: string,
      userValueType: string
    }
  }