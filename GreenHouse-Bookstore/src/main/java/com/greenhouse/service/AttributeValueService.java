package com.greenhouse.service;

import com.greenhouse.model.Attribute_Value;
import com.greenhouse.model.Product_Detail;

import java.util.List;

public interface AttributeValueService {

    List<Attribute_Value> findAll();

    Attribute_Value findById(Integer id);

    Attribute_Value add(Attribute_Value entity);

    Attribute_Value update(Attribute_Value entity);

    void delete(Integer id);

}
